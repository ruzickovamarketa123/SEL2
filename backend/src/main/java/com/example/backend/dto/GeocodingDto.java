package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

// Mirrors the JSON response returned by ORS's GEOCODING endpoint
// (https://api.openrouteservice.org/geocode/search).
// Used only inside TourService.geocodeLocation()
//
// ignoreUnknown = true: ORS's real response has ~20+ extra field
// Without this annotation, Jackson would throw an error the moment it hit a JSON field this class
// doesn't declare
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeocodingDto {

    public List<GeoFeature> features;

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GeoFeature {
        public GeoGeometry geometry;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GeoGeometry {
        // [longitude, latitude]
        // OPPOSITE order Leaflet expects on the frontend - MapViewModel.parseCoords swaps them
        public double[] coordinates;
    }
}
