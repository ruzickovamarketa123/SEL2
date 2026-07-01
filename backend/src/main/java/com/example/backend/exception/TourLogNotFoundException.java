package com.example.backend.exception;

public class TourLogNotFoundException extends RuntimeException {
    public TourLogNotFoundException(String message) {
        super(message);
    }
}