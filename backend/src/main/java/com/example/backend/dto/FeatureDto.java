package com.example.backend.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FeatureDto {
    public PropertiesDto properties;
    public Object geometry;
}