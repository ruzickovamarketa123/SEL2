package com.example.backend.controller;

import com.example.backend.dto.TourLogDto;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tours/{tourId}/logs")
public class TourLogController {

    // static list for now > to be implemented
    private final List<TourLogDto> tourLogs = List.of(
            new TourLogDto(1, 1, LocalDateTime.of(2023, 10, 1, 12, 0, 0), 5.5, 4, "first TourLog", "Easy", 70),
            new TourLogDto(2, 1, LocalDateTime.of(2023, 10, 5, 14, 30, 0), 5.0, 3, "second TourLog", "Easy", 60),
            new TourLogDto(3, 2, LocalDateTime.of(2023, 10, 10, 9, 15, 0), 20.2, 5, "first TourLog", "Hard", 120)
    );

    // specific tour log shown by tourlog id
    @GetMapping("/{id}")
    public TourLogDto read(@PathVariable int tourId, @PathVariable int id) {
        return tourLogs.stream()
                .filter(l -> l.getTourId() == tourId && l.getId() == id)
                .findFirst()
                .orElse(null);
    }

    @GetMapping
    public List<TourLogDto> readAll(@PathVariable int tourId) {
        return tourLogs.stream()
                .filter(l -> l.getTourId() == tourId)
                .collect(Collectors.toList());
    }

    @PostMapping
    public TourLogDto create(){
        return null;
    }

    @PutMapping("/{id}")
    public TourLogDto update(){
        return null;
    }

    @DeleteMapping("/{id}")
    public TourLogDto delete(){
        return null;
    }
}

