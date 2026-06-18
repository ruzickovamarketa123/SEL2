package com.example.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;


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
        public double[] coordinates;
    }
}
