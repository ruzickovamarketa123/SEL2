package com.example.backend.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

// One route result inside an OrsResponseDto.features list.
@JsonIgnoreProperties(ignoreUnknown = true)
public class FeatureDto {
    // Metadata about the route: distance, duration, turn-by-turn steps
    public PropertiesDto properties;
    // The route's shape, left as a generic Object on purpose:
    // it only needs to store it as-is so the frontend map can later draw it
    // Real shape: { type: "LineString", coordinates: [[lon,lat], ...] }
    public Object geometry;
}