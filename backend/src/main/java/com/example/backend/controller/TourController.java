package com.example.backend.controller;

import com.example.backend.dto.TourDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tours")
public class TourController {

    @GetMapping("/{id}")
    public TourDto read(@PathVariable int id){
        return new TourDto(1,"Paris City Tour","...", "Eiffel Tower", "Louvre", "Hike");
    }

    @GetMapping
    public List<TourDto> readAll(){
        return null;
    }

    @PostMapping
    public TourDto create(){
        return null;
    }

    @PutMapping("/{id}")
    public TourDto update(){
        return null;
    }

    @DeleteMapping("/{id}")
    public TourDto delete(){
        return null;
    }
}

