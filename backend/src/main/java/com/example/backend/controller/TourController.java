package com.example.backend.controller;

import com.example.backend.dto.TourDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tours")
public class TourController {

    // static list for now > to be implemented
    private final List<TourDto> tours = List.of(
            new TourDto(1, "Paris City Tour", "A beautiful tour of Paris.", "Eiffel Tower", "Louvre", "Hike"),
            new TourDto(2, "Tokyo Explorer", "Explore the streets of Tokyo.", "Shinjuku", "Shibuya", "Bike"),
            new TourDto(3, "New York Highlights", "Run through NYC landmarks.", "Central Park", "Times Square", "Running"),
            new TourDto(4, "Rome Historical Walk", "Walk through ancient Rome.", "Colosseum", "Vatican", "Hike"),
            new TourDto(5, "Safari Adventure", "Wildlife vacation in Kenya.", "Nairobi", "Maasai Mara", "Vacation")
    );

    // specific tour shown by tour id
    @GetMapping("/{id}")
    public TourDto read(@PathVariable int id) {
        return tours.stream()
                .filter(t -> t.getId() == id)
                .findFirst()
                .orElse(null);
    }

    @GetMapping
    public List<TourDto> readAll(){
        return tours;
    }

    @PostMapping
    public TourDto create(){
        return null;
    }

    @PutMapping("/{id}")
    public TourDto update(){
        return null;
    }

    @DeleteMapping("/{id}")
    public TourDto delete(){
        return null;
    }
}

