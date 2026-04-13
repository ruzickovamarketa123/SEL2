package com.example.backend.controller;

import com.example.backend.dto.TodoDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("/todos")
public class TodoController {

    @PostMapping("/{id}")
    public TodoDto read(@PathVariable int id){
        return new TodoDto(1,"kitchen",false);
    }

    @GetMapping
    public List<TodoDto> readAll(){
        return null;
    }

    @PostMapping
    public TodoDto create(){
        return null;
    }

    @PutMapping("/{id}")
    public TodoDto update(){
        return null;
    }

    @DeleteMapping("/{id}")
    public TodoDto delete(){
        return null;
    }
}
