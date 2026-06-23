package com.example.backend.controller;

import com.example.backend.entity.Tour;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.TourService;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    private static final Logger logger = LogManager.getLogger(TourController.class);

    private final UserRepository userRepository;
    private final TourService tourService;

    public TourController(TourService tourService, UserRepository userRepository) {
        this.tourService = tourService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Tour> readAll(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.debug("GET /api/tours for userId={}", userId);
        return tourService.findByUserId(userId);
    }

    @GetMapping("/search")
    public List<Tour> search(@RequestParam String q, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.debug("GET /api/tours/search?q={} for userId={}", q, userId);
        if (q == null || q.isBlank()) {
            return tourService.findByUserId(userId);
        }
        return tourService.search(q.trim(), userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tour> read(@PathVariable UUID id, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.debug("GET /api/tours/{} for userId={}", id, userId);
        return tourService.findById(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Tour create(@RequestBody Tour tour, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.info("POST /api/tours - creating tour '{}' for userId={}", tour.getName(), userId);
        return tourService.create(tour, userId);
    }

    @PutMapping("/{id}")
    public Tour update(@PathVariable UUID id, @RequestBody Tour tour, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.info("PUT /api/tours/{} by userId={}", id, userId);
        return tourService.update(id, tour, userId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.info("DELETE /api/tours/{}", id);
        tourService.deleteById(id, userId);
    }
}
