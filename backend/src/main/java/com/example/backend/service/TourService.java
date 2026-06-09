package com.example.backend.service;

import com.example.backend.dto.OrsResponseDto;
import com.example.backend.dto.SummaryDto;
import com.example.backend.entity.Tour;
import com.example.backend.entity.User;
import com.example.backend.repository.TourLogRepository;
import com.example.backend.repository.TourRepository;
import com.example.backend.repository.UserRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;

@Service
public class TourService {

    private static final Logger logger = LogManager.getLogger(TourService.class);

    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final TourLogRepository tourLogRepository;
    private final RestTemplate restTemplate;

    @Value("${ors.api.key}")
    private String apiKey;

    @Autowired
    public TourService(TourRepository tourRepository,
                       UserRepository userRepository,
                       TourLogRepository tourLogRepository) {
        this.tourRepository = tourRepository;
        this.userRepository = userRepository;
        this.tourLogRepository = tourLogRepository;
        this.restTemplate = new RestTemplate();
    }

    // Constructor for testing (allows injecting a mock RestTemplate)
    public TourService(TourRepository tourRepository,
                       UserRepository userRepository,
                       TourLogRepository tourLogRepository,
                       RestTemplate restTemplate) {
        this.tourRepository = tourRepository;
        this.userRepository = userRepository;
        this.tourLogRepository = tourLogRepository;
        this.restTemplate = restTemplate;
    }

    public Tour create(Tour tour, UUID userId) {
        logger.info("Creating tour '{}' for userId={}", tour.getName(), userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id={}", userId);
                    return new RuntimeException("User not found");
                });
        tour.setUser(user);

        String startCoords = tour.getFrom() != null ? tour.getFrom().replace(" ", "") : "";
        String endCoords = tour.getTo() != null ? tour.getTo().replace(" ", "") : "";
        String profile = getOrsProfile(tour.getTransportType());

        logger.debug("Calling ORS API: profile={}, from={}, to={}", profile, startCoords, endCoords);

        String url = "https://api.openrouteservice.org/v2/directions/" + profile + "?api_key=" + apiKey +
                "&start=" + startCoords + "&end=" + endCoords;

        try {
            OrsResponseDto response = restTemplate.getForObject(url, OrsResponseDto.class);

            if (response != null && response.features != null && !response.features.isEmpty()) {
                SummaryDto summary = response.features.get(0).properties.summary;
                tour.setDistance(summary.distance / 1000.0);
                tour.setEstimatedTime(summary.duration / 60.0);
                logger.debug("ORS response: distance={}km, time={}min", tour.getDistance(), tour.getEstimatedTime());
            }
        } catch (Exception e) {
            logger.warn("ORS call failed during create for tour '{}': {}", tour.getName(), e.getMessage());
            tour.setDistance(0.0);
            tour.setEstimatedTime(0.0);
        }

        Tour saved = tourRepository.save(tour);
        logger.info("Tour created successfully: id={}, name='{}'", saved.getId(), saved.getName());
        return saved;
    }

    public Tour update(UUID id, Tour tourDetails, UUID userId) {
        logger.info("Updating tour id={} by userId={}", id, userId);

        Tour existingTour = tourRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Tour not found with id={}", id);
                    return new RuntimeException("Tour not found");
                });

        if (!existingTour.getUser().getId().equals(userId)) {
            logger.warn("Unauthorized update attempt: userId={} tried to update tour id={}", userId, id);
            throw new RuntimeException("Not authorized to update this tour");
        }

        boolean routeOrTransportChanged =
                !Objects.equals(existingTour.getFrom(), tourDetails.getFrom()) ||
                        !Objects.equals(existingTour.getTo(), tourDetails.getTo()) ||
                        !Objects.equals(existingTour.getTransportType(), tourDetails.getTransportType());

        existingTour.setName(tourDetails.getName());
        existingTour.setDescription(tourDetails.getDescription());
        existingTour.setFrom(tourDetails.getFrom());
        existingTour.setTo(tourDetails.getTo());
        existingTour.setTransportType(tourDetails.getTransportType());

        if (routeOrTransportChanged) {
            logger.debug("Route/transport changed for tour id={}, recalculating ORS data", id);
            String profile = getOrsProfile(existingTour.getTransportType());
            String url = "https://api.openrouteservice.org/v2/directions/" + profile + "?api_key=" + apiKey +
                    "&start=" + existingTour.getFrom() + "&end=" + existingTour.getTo();

            try {
                OrsResponseDto response = restTemplate.getForObject(url, OrsResponseDto.class);

                if (response != null && response.features != null && !response.features.isEmpty()) {
                    SummaryDto summary = response.features.get(0).properties.summary;
                    existingTour.setDistance(summary.distance / 1000.0);
                    existingTour.setEstimatedTime(summary.duration / 60.0);
                }
            } catch (Exception e) {
                logger.warn("ORS call failed during update for tour id={}: {}", id, e.getMessage());
                existingTour.setDistance(0.0);
                existingTour.setEstimatedTime(0.0);
            }
        }

        Tour saved = tourRepository.save(existingTour);
        logger.info("Tour updated successfully: id={}", saved.getId());
        return saved;
    }

    @Transactional
    public void deleteById(UUID id) {
        logger.info("Deleting tour id={} and its logs", id);
        tourLogRepository.deleteByTourId(id);
        tourRepository.deleteById(id);
        logger.info("Tour id={} deleted successfully", id);
    }

    private String getOrsProfile(String transportType) {
        if (transportType == null) return "driving-car";
        return switch (transportType.toLowerCase()) {
            case "bike"     -> "cycling-regular";
            case "hike",
                 "running"  -> "foot-walking";
            default         -> "driving-car";
        };
    }

    public List<Tour> findByUserId(UUID userId) {
        logger.debug("Fetching tours for userId={}", userId);
        return tourRepository.findByUserId(userId);
    }

    public Optional<Tour> findById(UUID id) {
        logger.debug("Fetching tour id={}", id);
        return tourRepository.findById(id);
    }
}