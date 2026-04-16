package com.example.backend.dto;

public class TodoDto {

    private int id;

    private String name;

    private boolean done;

    public TodoDto(int id, String name, boolean done) {
        this.id = id;
        this.name = name;
        this.done = done;
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

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }
}