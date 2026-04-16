package com.example.backend.controller;

import com.example.backend.dto.TourDto;
import com.example.backend.entity.Tour;
import com.example.backend.repository.TourRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tours")
@CrossOrigin(origins = "http://localhost:4200")
public class TourController {

    private final TourRepository tourRepository;

    public TourController(TourRepository tourRepository) {
        this.tourRepository = tourRepository;
    }

    // specific tour shown by tour id
    @GetMapping("/{id}")
    public Tour read(@PathVariable long id) {
        return tourRepository.findById(id).orElse(null);
    }

    @GetMapping
    public List<Tour> readAll(){
        return (List<Tour>) tourRepository.findAll();
    }

    @PostMapping
    public Tour create(@RequestBody Tour tour) {
        return tourRepository.save(tour);
    }

    @PutMapping("/{id}")
    public Tour update(@PathVariable long id, @RequestBody Tour tour) {
        tour.setId(id);
        return tourRepository.save(tour);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable long id) {
        tourRepository.deleteById(id);
    }
}

