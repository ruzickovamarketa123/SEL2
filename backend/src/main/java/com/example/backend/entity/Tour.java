package com.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "tours")
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    private String description;
    private String fromLocation;
    private String toLocation;
    private String fromName;
    private String toName;
    private String transportType;
    private Double distance;
    private Double estimatedTime;

    @Column(columnDefinition = "TEXT")
    private String routeInformation;   // GeoJSON route geometry, stored as JSON text

    @Transient
    private int popularity;
    @Transient
    private int childFriendliness;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<TourLog> tourLogs = new ArrayList<>();

    public Tour() {}

    public Tour(String name, String description, String fromLocation, String toLocation,
                String transportType, Double distance, Double estimatedTime, String routeInformation) {
        this.name = name;
        this.description = description;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.transportType = transportType;
        this.distance = distance;
        this.estimatedTime = estimatedTime;
        this.routeInformation = routeInformation;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFrom() { return fromLocation; }
    public void setFrom(String from) { this.fromLocation = from; }

    public String getTo() { return toLocation; }
    public void setTo(String to) { this.toLocation = to; }

    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }

    public String getToName() { return toName; }
    public void setToName(String toName) { this.toName = toName; }

    public String getTransportType() { return transportType; }
    public void setTransportType(String transportType) { this.transportType = transportType; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getDistance() { return distance; }
    public void setDistance(Double distance) { this.distance = distance; }

    public Double getEstimatedTime() { return estimatedTime; }
    public void setEstimatedTime(Double estimatedTime) { this.estimatedTime = estimatedTime; }

    public String getRouteInformation() { return routeInformation; }
    public void setRouteInformation(String routeInformation) { this.routeInformation = routeInformation; }

    public List<TourLog> getTourLogs() { return tourLogs; }
    public void setTourLogs(List<TourLog> tourLogs) { this.tourLogs = tourLogs; }

    public int getPopularity() { return popularity; }
    public void setPopularity(int popularity) { this.popularity = popularity; }

    public int getChildFriendliness() { return childFriendliness; }
    public void setChildFriendliness(int childFriendliness) { this.childFriendliness = childFriendliness; }
}