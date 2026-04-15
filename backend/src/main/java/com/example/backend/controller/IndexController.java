package com.example.backend.controller;

import com.example.backend.dto.TodoDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndexController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello World!!!";
    }

    @GetMapping ("/test/todo")
    public TodoDto testDto() {
        return new TodoDto(1, "Shopping", false);
    }
}
