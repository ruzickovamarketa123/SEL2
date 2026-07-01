package com.example.backend.controller;

import com.example.backend.dto.UpdateUserDto;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LogManager.getLogger(UserController.class);

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/me")
    public void update(@RequestBody UpdateUserDto dto, HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("userId");
        logger.info("PUT /api/users/me for userId={}", userId);
        userService.updateProfile(userId, dto);
    }
}