package com.example.backend.entity;

import jakarta.persistence.*;
import java.util.UUID;
import com.example.backend.entity.User;

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
    private String transportType;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Tour() {}

    public Tour(String name, String description, String fromLocation, String toLocation, String transportType) {
        this.name = name;
        this.description = description;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.transportType = transportType;
    }

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {return description;}
    public void setDescription(String description) {this.description = description;}

    public String getFrom() {
        return fromLocation;
    }
    public void setFrom(String from) {
        this.fromLocation = from;
    }

    public String getTo() {return toLocation;}
    public void setTo(String to) {this.toLocation = to;}

    public String getTransportType() {return transportType;}
    public void setTransportType(String transportType) {this.transportType = transportType;}

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}


