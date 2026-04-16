package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tours")
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id = 0;
    private String name;
    private String description;
    private String fromLocation;
    private String toLocation;
    private String transportType;

    public Tour() {}


    public Tour(String name, String description, String fromLocation, String toLocation, String transportType) {
        this.name = name;
        this.description = description;
        this.fromLocation = fromLocation;
        this.toLocation = toLocation;
        this.transportType = transportType;
    }

    public long getId() {
        return id;
    }
    public void setId(long id) {
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
        this.fromLocation = fromLocation;
    }

    public String getTo() {return toLocation;}
    public void setTo(String to) {this.toLocation = toLocation;}

    public String getTransportType() {return transportType;}
    public void setTransportType(String transportType) {this.transportType = transportType;}
}


