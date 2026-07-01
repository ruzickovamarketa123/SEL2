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

@Service
public class TourService {

    private static final Logger logger = LogManager.getLogger(TourService.class);

    private static final String ORS_GEOCODING_URL  = "https://api.openrouteservice.org/geocode/search";
    private static final String ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/";

    private final TourRepository    tourRepository;
    private final UserRepository    userRepository;
    private final TourLogRepository tourLogRepository;
    private final RestTemplate      restTemplate;
    private final ObjectMapper      objectMapper = new ObjectMapper();

    @Value("${ors.api.key}")
    private String apiKey;

    @Autowired
    public TourService(TourRepository tourRepository,
                       UserRepository userRepository,
                       TourLogRepository tourLogRepository) {
        this.tourRepository    = tourRepository;
        this.userRepository    = userRepository;
        this.tourLogRepository = tourLogRepository;
        this.restTemplate      = new RestTemplate();
    }

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

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id={}", userId);
                    return new UserNotFoundException("User not found");
                });
        tour.setUser(user);

        String fromInput = tour.getFrom() != null ? tour.getFrom().trim() : "";
        String toInput   = tour.getTo()   != null ? tour.getTo().trim()   : "";

        String fromCoords = geocodeLocation(fromInput);
        String toCoords   = geocodeLocation(toInput);

        tour.setFrom(fromCoords);
        tour.setTo(toCoords);
        tour.setFromName(isCoordinate(fromInput) ? fromCoords : fromInput);
        tour.setToName(isCoordinate(toInput)     ? toCoords   : toInput);

        fetchAndApplyRouteData(tour, fromCoords, toCoords);

        Tour saved = tourRepository.save(tour);
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

        String newFrom = geocodeLocation(fromInput);
        String newTo   = geocodeLocation(toInput);
        String newFromName = isCoordinate(fromInput) ? newFrom : fromInput;
        String newToName   = isCoordinate(toInput)   ? newTo   : toInput;

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
        enrich(saved, tourLogRepository.findByTourId(saved.getId()));
        logger.info("Tour updated successfully: id={}", saved.getId());
        return saved;
    }

    @Transactional
    public void deleteById(UUID id, UUID userId) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new TourNotFoundException("Tour not found"));

        if (!tour.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized delete: userId={} tried to delete tour id={}", userId, id);
            throw new UnauthorizedAccessException("Not authorized to delete this tour");
        }
        logger.info("Deleting tour id={} and its logs", id);
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

        List<Tour> base = (term == null || term.isBlank())
                ? tourRepository.findByUserId(userId)
                : tourRepository.searchByUserId(userId, term);

        List<Tour> enriched = enrichAll(base, userId);

        return enriched.stream()
                .filter(t -> t.getPopularity() >= minPop && t.getChildFriendliness() >= minChild)
                .toList();
    }

    private List<Tour> enrichAll(List<Tour> tours, UUID userId) {
        List<TourLog> allLogs = tourLogRepository.findByTourUserId(userId);
        Map<UUID, List<TourLog>> logsByTour = allLogs.stream()
                .collect(Collectors.groupingBy(log -> log.getTour().getId()));
        for (Tour tour : tours) {
            enrich(tour, logsByTour.getOrDefault(tour.getId(), List.of()));
        }
        return tours;
    }

    private void enrich(Tour tour, List<TourLog> logs) {
        tour.setPopularity(calculatePopularity(logs));
        tour.setChildFriendliness(calculateChildFriendliness(logs));
    }

    int calculatePopularity(List<TourLog> logs) {
        if (logs.isEmpty()) return 0;
        return Math.min(5, logs.size());
    }

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

    String geocodeLocation(String location) {
        if (location == null || location.isBlank()) return location;

        String trimmed = location.trim();

        if (isCoordinate(trimmed)) {
            logger.debug("'{}' is already a coordinate — skipping geocoding", trimmed);
            return trimmed.replace(" ", "");
        }

        logger.debug("Geocoding location: '{}'", trimmed);

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

        return trimmed;
    }

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

    private String getOrsProfile(String transportType) {
        if (transportType == null) return "driving-car";
        return switch (transportType.toLowerCase()) {
            case "bike"              -> "cycling-regular";
            case "hike", "running"   -> "foot-walking";
            default                  -> "driving-car";
        };
    }

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