package com.example.backend.controller;

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
    
}
