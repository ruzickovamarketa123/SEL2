package com.example.backend.service;

import com.example.backend.dto.GeocodingDto;
import com.example.backend.dto.OrsResponseDto;
import com.example.backend.dto.SummaryDto;
import com.example.backend.entity.Tour;
import com.example.backend.entity.TourLog;
import com.example.backend.entity.User;
import com.example.backend.exception.TourNotFoundException;
import com.example.backend.exception.UnauthorizedAccessException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.repository.TourLogRepository;
import com.example.backend.repository.TourRepository;
import com.example.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

// This is where ALL domain logic for tours lives: geocoding, ORS Directions,
// computed attributes, ownership checks, and the full-text search filtering.
@Service
public class TourService {

    //every important step below writes to backend/logs/tourplanner.log at INFO/DEBUG or WARN/ERROR
    private static final Logger logger = LogManager.getLogger(TourService.class);

    // Base URLs of the two OpenRouteService endpoints used by this class
    private static final String ORS_GEOCODING_URL  = "https://api.openrouteservice.org/geocode/search";
    private static final String ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/";

    //Data Access Layer dependencies (Repository Pattern)
    // this is the only place in the class allowed to talk to the database
    // and only through these repository interfaces
    private final TourRepository    tourRepository;
    private final UserRepository    userRepository;
    private final TourLogRepository tourLogRepository;

    // HTTP client used to call the external OpenRouteService API.
    private final RestTemplate      restTemplate;

    // Converts Java objects to/from JSON
    // Used here to serialize the route geometry object into a string before storing
    // it in the routeInformation column.
    private final ObjectMapper      objectMapper = new ObjectMapper();

    // Injected from application-local.properties
    @Value("${ors.api.key}")
    private String apiKey;

    // Production constructor: Spring calls this automatically (@Autowired),
    // creating a real RestTemplate that makes real HTTP calls to the internet.
    @Autowired
    public TourService(TourRepository tourRepository,
                       UserRepository userRepository,
                       TourLogRepository tourLogRepository) {
        this.tourRepository    = tourRepository;
        this.userRepository    = userRepository;
        this.tourLogRepository = tourLogRepository;
        this.restTemplate      = new RestTemplate();
    }

    // Test-only constructor: lets TourServiceTest pass in a *mocked*
    // RestTemplate (via Mockito), so unit tests can simulate ORS responses
    // (including failures) without ever making a real network call.
    public TourService(TourRepository tourRepository,
                       UserRepository userRepository,
                       TourLogRepository tourLogRepository,
                       RestTemplate restTemplate) {
        this.tourRepository    = tourRepository;
        this.userRepository    = userRepository;
        this.tourLogRepository = tourLogRepository;
        this.restTemplate      = restTemplate;
    }

    public Tour create(Tour tour, UUID userId) {
        logger.info("Creating tour '{}' for userId={}", tour.getName(), userId);

        //userId comes from the JWT, set by JwtFilter
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id={}", userId);
                    return new UserNotFoundException("User not found");
                });
        tour.setUser(user);

        String fromInput = tour.getFrom() != null ? tour.getFrom().trim() : "";
        String toInput   = tour.getTo()   != null ? tour.getTo().trim()   : "";

        // Turn place names into "lon,lat" strings.
        String fromCoords = geocodeLocation(fromInput);
        String toCoords   = geocodeLocation(toInput);

        tour.setFrom(fromCoords);
        tour.setTo(toCoords);

        // Keep a name for display purposes.
        tour.setFromName(isCoordinate(fromInput) ? fromCoords : fromInput);
        tour.setToName(isCoordinate(toInput)     ? toCoords   : toInput);

        // Call ORS Directions to fill in distance, estimated time and the
        // route geometry (used later by the frontend map)
        fetchAndApplyRouteData(tour, fromCoords, toCoords);

        Tour saved = tourRepository.save(tour);

        // A new tour has no logs yet, so popularity/child-friendliness
        // both start at their "empty" values
        enrich(saved, List.of());
        logger.info("Tour created successfully: id={}, name='{}'", saved.getId(), saved.getName());
        return saved;
    }

    public Tour update(UUID id, Tour tourDetails, UUID userId) {
        logger.info("Updating tour id={} by userId={}", id, userId);

        Tour existingTour = tourRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Tour not found with id={}", id);
                    return new TourNotFoundException("Tour not found");
                });

        if (!existingTour.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized update attempt: userId={} tried to update tour id={}", userId, id);
            throw new UnauthorizedAccessException("Not authorized to update this tour");
        }

        String fromInput = tourDetails.getFrom() != null ? tourDetails.getFrom().trim() : "";
        String toInput   = tourDetails.getTo()   != null ? tourDetails.getTo().trim()   : "";

        // Re-geocode the (possibly changed) from/to text.
        String newFrom = geocodeLocation(fromInput);
        String newTo   = geocodeLocation(toInput);
        String newFromName = isCoordinate(fromInput) ? newFrom : fromInput;
        String newToName   = isCoordinate(toInput)   ? newTo   : toInput;

        //only call ORS Directions again if something that
        // actually affects the route changed (start point, end point, or
        // transport type/profile).
        boolean routeOrTransportChanged =
                !Objects.equals(existingTour.getFrom(), newFrom) ||
                        !Objects.equals(existingTour.getTo(),   newTo)   ||
                        !Objects.equals(existingTour.getTransportType(), tourDetails.getTransportType());

        existingTour.setName(tourDetails.getName());
        existingTour.setDescription(tourDetails.getDescription());
        existingTour.setFrom(newFrom);
        existingTour.setTo(newTo);
        existingTour.setFromName(newFromName);
        existingTour.setToName(newToName);
        existingTour.setTransportType(tourDetails.getTransportType());

        if (routeOrTransportChanged) {
            logger.debug("Route/transport changed for tour id={}, recalculating ORS data", id);
            fetchAndApplyRouteData(existingTour, newFrom, newTo);
        }

        Tour saved = tourRepository.save(existingTour);
        //an updated tour might already have logs
        // load them so popularity/child-friendliness reflect the real history.
        enrich(saved, tourLogRepository.findByTourId(saved.getId()));
        logger.info("Tour updated successfully: id={}", saved.getId());
        return saved;
    }

    // @Transactional: both delete operations below either both succeed or both roll back together
    @Transactional
    public void deleteById(UUID id, UUID userId) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new TourNotFoundException("Tour not found"));

        if (!tour.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized delete: userId={} tried to delete tour id={}", userId, id);
            throw new UnauthorizedAccessException("Not authorized to delete this tour");
        }
        logger.info("Deleting tour id={} and its logs", id);
        // Delete the logs before the tour to avoid a foreign key constraint violation
        tourLogRepository.deleteByTourId(id);
        tourRepository.deleteById(id);
        logger.info("Tour id={} deleted successfully", id);
    }

    public List<Tour> findByUserId(UUID userId) {
        logger.debug("Fetching tours for userId={}", userId);
        return enrichAll(tourRepository.findByUserId(userId), userId);
    }

    public Optional<Tour> findById(UUID id,  UUID userId) {
        logger.debug("Fetching tour id={} for userId={}", id, userId);
        return tourRepository.findById(id)
                .filter(tour -> tour.getUser().getId().equals(userId))
                .map(tour -> {
                    enrich(tour, tourLogRepository.findByTourId(id));
                    return tour;
                });
    }

    public List<Tour> search(String term, Integer minPopularity, Integer minChildFriendliness, UUID userId) {
        int minPop   = (minPopularity == null)        ? 0 : minPopularity;
        int minChild = (minChildFriendliness == null) ? 0 : minChildFriendliness;
        logger.debug("Full-text search: term='{}' minPop={} minChild={} userId={}", term, minPop, minChild, userId);

        // If there's no search text, just return everything for this user;
        // otherwise delegate the actual text matching to the JPQL query in TourRepository
        List<Tour> base = (term == null || term.isBlank())
                ? tourRepository.findByUserId(userId)
                : tourRepository.searchByUserId(userId, term);

        // Compute popularity/child-friendliness for every result.
        List<Tour> enriched = enrichAll(base, userId);
        // and only THEN filter by the minimum thresholds, because these
        // two fields are @Transient — the database has no idea they exist
        return enriched.stream()
                .filter(t -> t.getPopularity() >= minPop && t.getChildFriendliness() >= minChild)
                .toList();
    }

    // Enriches a whole list of tours with computed attributes,
    // instead of calling findByTourId() once PER tour, it loads ALL of
    // this user's logs in a single query, then groups them in memory by tour id
    private List<Tour> enrichAll(List<Tour> tours, UUID userId) {
        List<TourLog> allLogs = tourLogRepository.findByTourUserId(userId);
        // getOrDefault(..., List.of()): a tour with zero logs gets an empty list
        Map<UUID, List<TourLog>> logsByTour = allLogs.stream()
                .collect(Collectors.groupingBy(log -> log.getTour().getId()));
        for (Tour tour : tours) {
            enrich(tour, logsByTour.getOrDefault(tour.getId(), List.of()));
        }
        return tours;
    }

    //Nothing here is ever written to the database — it's recalculated
    // fresh every time a tour is read (@Transient)
    private void enrich(Tour tour, List<TourLog> logs) {
        tour.setPopularity(calculatePopularity(logs));
        tour.setChildFriendliness(calculateChildFriendliness(logs));
    }

    int calculatePopularity(List<TourLog> logs) {
        if (logs.isEmpty()) return 0;
        return Math.min(5, logs.size());
    }

    //start from a perfect score of 5, and subtract penalties based on the hardest difficulty,
    // the average distance, and the average time
    int calculateChildFriendliness(List<TourLog> logs) {
        if (logs.isEmpty()) return 0;
        int score = 5;

        if      (logs.stream().anyMatch(l -> "Expert".equalsIgnoreCase(l.getDifficulty()))) score -= 3;
        else if (logs.stream().anyMatch(l -> "Hard".equalsIgnoreCase(l.getDifficulty())))   score -= 2;
        else if (logs.stream().anyMatch(l -> "Medium".equalsIgnoreCase(l.getDifficulty()))) score -= 1;

        double avgDistance = logs.stream().mapToDouble(TourLog::getTotalDistance).average().orElse(0);
        if      (avgDistance > 15) score -= 2;
        else if (avgDistance > 8)  score -= 1;

        double avgTime = logs.stream().mapToDouble(TourLog::getTotalTime).average().orElse(0);
        if      (avgTime > 240) score -= 2;
        else if (avgTime > 120) score -= 1;

        return Math.max(1, score);
    }

    // Turns a place name into "lon,lat"
    String geocodeLocation(String location) {
        if (location == null || location.isBlank()) return location;

        String trimmed = location.trim();

        if (isCoordinate(trimmed)) {
            logger.debug("'{}' is already a coordinate — skipping geocoding", trimmed);
            return trimmed.replace(" ", "");
        }

        logger.debug("Geocoding location: '{}'", trimmed);
        // URLEncoder.encode() makes sure spaces/special characters in place names don't break the URL
        String url = ORS_GEOCODING_URL
                + "?api_key=" + apiKey
                + "&text=" + java.net.URLEncoder.encode(trimmed, java.nio.charset.StandardCharsets.UTF_8)
                + "&size=1";

        try {
            GeocodingDto response = restTemplate.getForObject(url, GeocodingDto.class);

            if (response != null
                    && response.features != null
                    && !response.features.isEmpty()
                    && response.features.get(0).geometry != null
                    && response.features.get(0).geometry.coordinates != null) {

                double[] coords = response.features.get(0).geometry.coordinates;
                String result = coords[0] + "," + coords[1];
                logger.debug("Geocoded '{}' → {}", trimmed, result);
                return result;
            }

            logger.warn("Geocoding returned no results for '{}'", trimmed);
        } catch (Exception e) {
            logger.warn("Geocoding failed for '{}': {}", trimmed, e.getMessage());
        }
        // Fallback: return the original text untouched. The tour still
        // gets created, just without valid coordinates
        return trimmed;
    }
    // Calls ORS Directions to get distance, estimated time, and the route geometry
    private void fetchAndApplyRouteData(Tour tour, String fromCoords, String toCoords) {
        String profile = getOrsProfile(tour.getTransportType());
        String url = ORS_DIRECTIONS_URL + profile
                + "?api_key=" + apiKey
                + "&start=" + fromCoords
                + "&end="   + toCoords;

        logger.debug("Calling ORS Directions: profile={}, from={}, to={}", profile, fromCoords, toCoords);

        try {
            OrsResponseDto response = restTemplate.getForObject(url, OrsResponseDto.class);

            if (response != null && response.features != null && !response.features.isEmpty()) {
                SummaryDto summary = response.features.get(0).properties.summary;
                tour.setDistance(summary.distance / 1000.0);
                tour.setEstimatedTime(summary.duration / 60.0);


                // The raw route shape (GeoJSON), left untyped (Object) on purpose:
                // this service doesn't need to understand its internal structure,
                // it just needs to store it as-is so the frontend map can draw it later.
                Object geometry = response.features.get(0).geometry;
                if (geometry != null) {
                    try {
                        tour.setRouteInformation(objectMapper.writeValueAsString(geometry));
                    } catch (Exception e) {
                        logger.warn("Failed to serialize route geometry for tour '{}': {}", tour.getName(), e.getMessage());
                    }
                }

                logger.debug("ORS Directions: distance={}km, time={}min",
                        tour.getDistance(), tour.getEstimatedTime());
            } else {
                logger.warn("ORS Directions returned empty response for tour '{}'", tour.getName());
                tour.setDistance(0.0);
                tour.setEstimatedTime(0.0);
            }
        } catch (Exception e) {
            logger.warn("ORS Directions call failed for tour '{}': {}", tour.getName(), e.getMessage());
            tour.setDistance(0.0);
            tour.setEstimatedTime(0.0);
        }
    }
    // Maps this app's transport type values to the routing profile names
    // that the OpenRouteService Directions API expects.
    private String getOrsProfile(String transportType) {
        if (transportType == null) return "driving-car";
        return switch (transportType.toLowerCase()) {
            case "bike"              -> "cycling-regular";
            case "hike", "running"   -> "foot-walking";
            default                  -> "driving-car";
        };
    }

    //used to decide whether geocoding can be skipped entirely.
    private boolean isCoordinate(String value) {
        String[] parts = value.split(",");
        if (parts.length != 2) return false;
        try {
            Double.parseDouble(parts[0].trim());
            Double.parseDouble(parts[1].trim());
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}