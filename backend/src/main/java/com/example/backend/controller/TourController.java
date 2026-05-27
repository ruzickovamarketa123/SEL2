package com.example.backend.controller;
import com.example.backend.entity.Tour;
import com.example.backend.entity.User;
import com.example.backend.repository.TourRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.TourService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    private final UserRepository userRepository;
    private final TourService tourService;

    public TourController(TourService tourService, UserRepository userRepository) {
        this.tourService = tourService;
        this.userRepository = userRepository;
    }

    // specific tour shown by tour id
    @GetMapping("/{id}")
    public Tour read(@PathVariable UUID id) {
        return tourService.findById(id).orElse(null);
    }

    @GetMapping
    public List<Tour> readAll(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return tourService.findByUserId(userId);
    }

    @PostMapping
    public Tour create(@RequestBody Tour tour, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return tourService.create(tour, userId);
    }

    @PutMapping("/{id}")
    public Tour update(@PathVariable UUID id, @RequestBody Tour tour, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return tourService.update(id, tour, userId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        tourService.deleteById(id);
    }
}

