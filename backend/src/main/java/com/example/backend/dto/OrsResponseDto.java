package com.example.backend.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// Mirrors the JSON response returned by ORS's DIRECTIONS endpoint
// (https://api.openrouteservice.org/v2/directions/{profile}).
// Used only inside TourService.fetchAndApplyRouteData()
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrsResponseDto {
    // ORS wraps the actual route data inside a "features" list
    public List<FeatureDto> features;
}
