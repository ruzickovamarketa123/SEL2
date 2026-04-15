package com.example.backend.controller;

import com.example.backend.dto.TourLogDto;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/tours/{tourId}/logs")
public class TourLogController {

    @GetMapping("/{id}")
    public TourLogDto read(@PathVariable int id){
        return new TourLogDto(1,1, LocalDateTime.of(2024,10,1,12,0,0), 5.5, 4, "first TouLog", "Easy", 70);
    }

    @GetMapping
    public List<TourLogDto> readAll(){
        return null;
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

