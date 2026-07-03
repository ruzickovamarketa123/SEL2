package com.example.backend.dto;

import com.example.backend.entity.TourLog;
import jakarta.validation.constraints.*;

import java.util.UUID;

public class TourLogDto {
    private UUID id;
    private UUID tourId;

    @NotBlank(message = "Date is required")
    private String date;

    @NotBlank(message = "Time is required")
    private String time;

    @Positive(message = "Distance must be greater than 0")
    private double totalDistance;

    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private int rating;

    @NotBlank(message = "Comment is required")
    private String comment;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @Positive(message = "Time must be greater than 0")
    private double totalTime;

    public TourLogDto(TourLog log) {
        this.id = log.getId();
        this.tourId = log.getTour().getId();
        this.date = log.getDateTime().toLocalDate().toString();
        this.time = log.getDateTime().toLocalTime().toString();
        this.totalDistance = log.getTotalDistance();
        this.rating = log.getRating();
        this.comment = log.getComment();
        this.difficulty = log.getDifficulty();
        this.totalTime = log.getTotalTime();
    }

    public TourLogDto() {}

    public UUID getId() { return id; }
    public UUID getTourId() { return tourId; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public double getTotalDistance() { return totalDistance; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
    public String getDifficulty() { return difficulty; }
    public double getTotalTime() { return totalTime; }

    public void setId(UUID id) { this.id = id; }
    public void setTourId(UUID tourId) { this.tourId = tourId; }
    public void setDate(String date) { this.date = date; }
    public void setTime(String time) { this.time = time; }
    public void setTotalDistance(double totalDistance) { this.totalDistance = totalDistance; }
    public void setRating(int rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setTotalTime(double totalTime) { this.totalTime = totalTime; }

}