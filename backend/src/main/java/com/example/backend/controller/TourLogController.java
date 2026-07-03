package com.example.backend.controller;

import com.example.backend.dto.TourLogDto;
import com.example.backend.service.TourLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/logs")
public class TourLogController {

    private static final Logger logger = LogManager.getLogger(TourLogController.class);

    private final TourLogService tourLogService;

    public TourLogController(TourLogService tourLogService) {
        this.tourLogService = tourLogService;
    }

    @GetMapping
    public List<TourLogDto> readAll(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.debug("GET /api/logs for userId={}", userId);
        return tourLogService.findAllByUser(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourLogDto> read(@PathVariable UUID id, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.debug("GET /api/logs/{} for userId={}", id, userId);
        try {
            return ResponseEntity.ok(tourLogService.findById(id, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public TourLogDto create(@Valid @RequestBody TourLogDto dto, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.info("POST /api/logs for tourId={} userId={}", dto.getTourId(), userId);
        return tourLogService.create(dto, userId);
    }

    @PutMapping("/{id}")
    public TourLogDto update(@PathVariable UUID id,
                             @Valid @RequestBody TourLogDto dto,
                             HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.info("PUT /api/logs/{} by userId={}", id, userId);
        return tourLogService.update(id, dto, userId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.info("DELETE /api/logs/{} by userId={}", id, userId);
        tourLogService.delete(id, userId);
    }
}
