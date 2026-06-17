package com.example.backend.controller;

import com.example.backend.dto.TourLogDto;
import com.example.backend.entity.TourLog;
import com.example.backend.entity.Tour;
import com.example.backend.repository.TourLogRepository;
import com.example.backend.repository.TourRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logs")
public class TourLogController {

    private static final Logger logger = LogManager.getLogger(TourLogController.class);

    private final TourLogRepository tourLogRepository;
    private final TourRepository tourRepository;

    public TourLogController(TourLogRepository tourLogRepository, TourRepository tourRepository) {
        this.tourLogRepository = tourLogRepository;
        this.tourRepository = tourRepository;
    }

    @GetMapping
    public List<TourLogDto> readAll() {
        logger.debug("GET /api/logs");
        return tourLogRepository.findAll().stream().map(TourLogDto::new).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourLogDto> read(@PathVariable UUID id) {
        logger.debug("GET /api/logs/{}", id);
        return tourLogRepository.findById(id)
                .map(TourLogDto::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public TourLogDto create(@RequestBody TourLogDto dto) {
        logger.info("POST /api/logs for tourId={}", dto.getTourId());
        Tour tour = tourRepository.findById(dto.getTourId()).orElseThrow();
        LocalDateTime dateTime = LocalDateTime.of(
                LocalDate.parse(dto.getDate()),
                LocalTime.parse(dto.getTime())
        );
        TourLog log = new TourLog(tour, dateTime, dto.getTotalDistance(),
                dto.getRating(), dto.getComment(), dto.getDifficulty(), dto.getTotalTime());
        TourLogDto saved = new TourLogDto(tourLogRepository.save(log));
        logger.info("TourLog created: id={}", saved.getId());
        return saved;
    }

    @PutMapping("/{id}")
    public TourLogDto update(@PathVariable UUID id, @RequestBody TourLogDto dto) {
        logger.info("PUT /api/logs/{}", id);
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
        logger.info("DELETE /api/logs/{}", id);
        tourLogRepository.deleteById(id);
    }
}