package com.example.backend.controller;
import com.example.backend.entity.Tour;
import com.example.backend.entity.User;
import com.example.backend.repository.TourRepository;
import com.example.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tours")
@CrossOrigin(origins = "http://localhost:4200")
public class TourController {

    private final TourRepository tourRepository;
    private final UserRepository userRepository;

    public TourController(TourRepository tourRepository, UserRepository userRepository) {
        this.tourRepository = tourRepository;
        this.userRepository = userRepository;
    }

    // specific tour shown by tour id
    @GetMapping("/{id}")
    public Tour read(@PathVariable UUID id) {
        return tourRepository.findById(id).orElse(null);
    }

    @GetMapping
    public List<Tour> readAll(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        return tourRepository.findByUserId(userId);
    }

    @PostMapping
    public Tour create(@RequestBody Tour tour, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElseThrow();
        tour.setUser(user);
        return tourRepository.save(tour);
    }

    @PutMapping("/{id}")
    public Tour update(@PathVariable UUID id, @RequestBody Tour tour) {
        tour.setId(id);
        return tourRepository.save(tour);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        tourRepository.deleteById(id);
    }
}

