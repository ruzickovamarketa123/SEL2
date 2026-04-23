package com.example.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tour_logs")
public class TourLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    private LocalDateTime dateTime;
    private double totalDistance;
    private int rating;
    private String comment;
    private String difficulty;
    private double totalTime;

    public TourLog() {}

    public TourLog(Tour tour, LocalDateTime dateTime, double totalDistance, int rating, String comment, String difficulty, double totalTime) {
        this.tour = tour;
        this.dateTime = dateTime;
        this.totalDistance = totalDistance;
        this.rating = rating;
        this.comment = comment;
        this.difficulty = difficulty;
        this.totalTime = totalTime;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Tour getTour() { return tour; }
    public void setTour(Tour tour) { this.tour = tour; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public double getTotalDistance() { return totalDistance; }
    public void setTotalDistance(double totalDistance) { this.totalDistance = totalDistance; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public double getTotalTime() { return totalTime; }
    public void setTotalTime(double totalTime) { this.totalTime = totalTime; }

}