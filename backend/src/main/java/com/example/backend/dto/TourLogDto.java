package com.example.backend.dto;

import java.time.LocalDateTime;

public class TourLogDto {
    private int id;
    private int tourId;
    private LocalDateTime dateTime;
    private double totalDistance;
    private int rating;
    private String comment;
    private String difficulty;
    private double totalTime;

    public TourLogDto(int id, int tourId, LocalDateTime dateTime, double totalDistance, int rating, String comment, String difficulty, double totalTime) {
        this.id = id;
        this.tourId = tourId;
        this.dateTime = dateTime;
        this.totalDistance = totalDistance;
        this.rating = rating;
        this.comment = comment;
        this.difficulty = difficulty;
        this.totalTime = totalTime;
    }

    public int getId() {return id;}
    public void setId(int id) {this.id = id;}

    public int getTourId() {return tourId;}
    public void setTourId(int tourId) {this.tourId = tourId;}

    public LocalDateTime getDateTime() {return dateTime;}
    public void setDateTime(LocalDateTime dateTime) {this.dateTime = dateTime;}

    public double getTotalDistance() {return totalDistance;}
    public void setTotalDistance(double totalDistance) {this.totalDistance = totalDistance;}

    public int getRating() {return rating;}
    public void setRating(int rating) {this.rating = rating;}

    public String getComment() {return comment;}
    public void setComment(String comment) {this.comment = comment;}

    public String getDifficulty() {return difficulty;}
    public void setDifficulty(String difficulty) {this.difficulty = difficulty;}

    public double getTotalTime() {return totalTime;}
    public void setTotalTime(double totalTime) {this.totalTime = totalTime;}
}

