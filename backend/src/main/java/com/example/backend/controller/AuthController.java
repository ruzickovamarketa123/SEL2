package com.example.backend.controller;

import com.example.backend.dto.AuthResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.service.AuthService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LogManager.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponseDto register(@RequestBody RegisterRequestDto dto) {
        logger.info("POST /api/auth/register - username='{}'", dto.getUsername());
        return authService.register(dto);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@RequestBody LoginRequestDto dto) {
        logger.info("POST /api/auth/login - username='{}'", dto.getUsername());
        return authService.login(dto);
    }
}