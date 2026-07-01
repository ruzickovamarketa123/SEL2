package com.example.backend.dto;

import java.time.Instant;

public class ErrorResponseDto {
    private final Instant timestamp;
    private final int status;
    private final String message;

    public ErrorResponseDto(int status, String message) {
        this.timestamp = Instant.now();
        this.status = status;
        this.message = message;
    }

    public Instant getTimestamp() { return timestamp; }
    public int getStatus() { return status; }
    public String getMessage() { return message; }
}