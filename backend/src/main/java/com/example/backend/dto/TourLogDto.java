package com.example.backend.dto;

import com.example.backend.entity.TourLog;
import java.util.UUID;

public class TourLogDto {
    private UUID id;
    private UUID tourId;
    private String date;
    private String time;
    private double totalDistance;
    private int rating;
    private String comment;
    private String difficulty;
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

    public UUID getId() { return id; }
    public UUID getTourId() { return tourId; }
    public String getDate() { return date; }
    public String getTime() { return time; }
    public double getTotalDistance() { return totalDistance; }
    public int getRating() { return rating; }
    public String getComment() { return comment; }
    public String getDifficulty() { return difficulty; }
    public double getTotalTime() { return totalTime; }
}