package com.example.backend.controller;

import com.example.backend.dto.TodoDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

//serves as a check for the backend
@RestController
public class IndexController {

    // checks in the simplest possible way whether the server is running
    @GetMapping("/hello")
    public String hello() {
        return "Hello World!!!";
    }

    // checks that DTO serialization works - that spring can correctly convert a Java object into JSON
    @GetMapping("/test/todo")
    public TodoDto testDto() {
        return new TodoDto(1,"shopping", false);
    }

}
