package com.example.backend.controller;

import com.example.backend.dto.TourLogDto;
import com.example.backend.entity.TourLog;
import com.example.backend.repository.TourLogRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/logs")
public class TourLogController {

    private final TourLogRepository tourLogRepository;

    public TourLogController(TourLogRepository tourLogRepository) {
        this.tourLogRepository = tourLogRepository;
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

    @PostMapping
    public TourLog create(@RequestBody TourLog tourLog) {
        return tourLogRepository.save(tourLog);
    }

    @PutMapping("/{id}")
    public TourLog update(@PathVariable UUID id, @RequestBody TourLog tourLog) {
        tourLog.setId(id);
        return tourLogRepository.save(tourLog);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        tourLogRepository.deleteById(id);
    }
}