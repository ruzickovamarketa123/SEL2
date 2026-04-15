package com.example.backend.dto;

public class TourDto {

    private int id;
    private String name;
    private String description;
    private String from;
    private String to;
    private String transportType;

    public TourDto(int id, String name, String description, String from, String to, String transportType) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.from = from;
        this.to = to;
        this.transportType = transportType;
    }

    public int getId() {
        return id;
    }
    public void setId(int id) {
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
        return from;
    }
    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {return to;}
    public void setTo(String to) {this.to = to;}

    public String getTransportType() {return transportType;}
    public void setTransportType(String transportType) {this.transportType = transportType;}
}
