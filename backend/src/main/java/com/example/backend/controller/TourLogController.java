package com.example.backend.controller;

import com.example.backend.dto.TourLogDto;
import com.example.backend.entity.TourLog;
import com.example.backend.entity.Tour;
import com.example.backend.repository.TourLogRepository;
import com.example.backend.repository.TourRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/logs")
public class TourLogController {

    private final TourLogRepository tourLogRepository;
    private final TourRepository tourRepository;

    public TourLogController(TourLogRepository tourLogRepository, TourRepository tourRepository) {
        this.tourLogRepository = tourLogRepository;
        this.tourRepository = tourRepository;
    }

    @GetMapping
    public List<TourLogDto> readAll() {
        return tourLogRepository.findAll()
                .stream()
                .map(TourLogDto::new)
                .toList();
    }

    @GetMapping("/{id}")
    public TourLogDto read(@PathVariable UUID id) {
        return tourLogRepository.findById(id)
                .map(TourLogDto::new)
                .orElse(null);
    }

    // Accepts flat DTO from frontend (tourId + date/time strings),
    // looks up the Tour entity, builds TourLog, and returns DTO
    @PostMapping
    public TourLogDto create(@RequestBody TourLogDto dto) {
        Tour tour = tourRepository.findById(dto.getTourId()).orElseThrow();
        LocalDateTime dateTime = LocalDateTime.of(
                LocalDate.parse(dto.getDate()),
                LocalTime.parse(dto.getTime())
        );
        TourLog log = new TourLog(tour, dateTime, dto.getTotalDistance(),
                dto.getRating(), dto.getComment(), dto.getDifficulty(), dto.getTotalTime());
        return new TourLogDto(tourLogRepository.save(log));
    }

    // Same as create, but sets the ID from the path variable before saving
    @PutMapping("/{id}")
    public TourLogDto update(@PathVariable UUID id, @RequestBody TourLogDto dto) {
        Tour tour = tourRepository.findById(dto.getTourId()).orElseThrow();
        LocalDateTime dateTime = LocalDateTime.of(
                LocalDate.parse(dto.getDate()),
                LocalTime.parse(dto.getTime())
        );
        TourLog log = new TourLog(tour, dateTime, dto.getTotalDistance(),
                dto.getRating(), dto.getComment(), dto.getDifficulty(), dto.getTotalTime());
        log.setId(id);
        return new TourLogDto(tourLogRepository.save(log));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        tourLogRepository.deleteById(id);
    }
}