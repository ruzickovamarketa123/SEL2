package com.example.backend.service;

import com.example.backend.dto.OrsResponseDto;
import com.example.backend.dto.SummaryDto;
import com.example.backend.entity.Tour;
import com.example.backend.entity.User;
import com.example.backend.repository.TourRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;

@Service
public class TourService {
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ors.api.key}")
    private String apiKey;

    public TourService(TourRepository tourRepository, UserRepository userRepository) {
        this.tourRepository = tourRepository;
        this.userRepository = userRepository;
    }

    public Tour create(Tour tour, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        tour.setUser(user);

        String startCoords = tour.getFrom() != null ? tour.getFrom().replace(" ", "") : "";
        String endCoords = tour.getTo() != null ? tour.getTo().replace(" ", "") : "";

        String url = "https://api.openrouteservice.org/v2/directions/driving-car?api_key=" + apiKey +
                "&start=" + startCoords + "&end=" + endCoords;

        System.out.println("URL CHE JAVA STA PROVANDO A CHIAMARE: " + url);

        try {
            OrsResponseDto response = restTemplate.getForObject(url, OrsResponseDto.class);

            if (response != null && response.features != null && !response.features.isEmpty()) {
                SummaryDto summary = response.features.get(0).properties.summary;
                tour.setDistance(summary.distance / 1000.0);
                tour.setEstimatedTime(summary.duration / 60.0);
            }
        } catch (Exception e) {
            System.err.println("========== ERRORE OPEN ROUTE SERVICE ==========");
            e.printStackTrace();
            System.err.println("===============================================");
            tour.setDistance(0.0);
            tour.setEstimatedTime(0.0);
        }

        return tourRepository.save(tour);
    }

    public Tour update(UUID id, Tour tourDetails, UUID userId) {
        Tour existingTour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        if (!existingTour.getUser().getId().equals(userId)) {
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
            String startCoords = existingTour.getFrom();
            String endCoords = existingTour.getTo();
            String profile = getOrsProfile(existingTour.getTransportType());

            String url = "https://api.openrouteservice.org/v2/directions/" + profile + "?api_key=" + apiKey +
                    "&start=" + startCoords + "&end=" + endCoords;

            try {
                OrsResponseDto response = restTemplate.getForObject(url, OrsResponseDto.class);

                if (response != null && response.features != null && !response.features.isEmpty()) {
                    SummaryDto summary = response.features.get(0).properties.summary;
                    existingTour.setDistance(summary.distance / 1000.0);
                    existingTour.setEstimatedTime(summary.duration / 60.0);
                }
            } catch (Exception e) {
                System.err.println("Error calling ORS during update: " + e.getMessage());
                existingTour.setDistance(0.0);
                existingTour.setEstimatedTime(0.0);
            }
        }

        return tourRepository.save(existingTour);
    }

    private String getOrsProfile(String transportType) {
        if (transportType == null) {
            return "driving-car";
        }
        switch (transportType.toLowerCase()) {
            case "bike":
                return "cycling-regular";
            case "hike":
            case "running":
                return "foot-walking";
            case "vacation":
            default:
                return "driving-car";
        }
    }

    public List<Tour> findByUserId(UUID userId) {
        return tourRepository.findByUserId(userId);
    }

    public Optional<Tour> findById(UUID id) {
        return tourRepository.findById(id);
    }


    public void deleteById(UUID id) {
        tourRepository.deleteById(id);
    }
}