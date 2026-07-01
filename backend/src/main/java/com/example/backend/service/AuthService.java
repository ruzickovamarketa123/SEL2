package com.example.backend.service;

import com.example.backend.dto.AuthResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger logger = LogManager.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponseDto register(RegisterRequestDto dto) {
        logger.info("Registering new user '{}'", dto.getUsername());

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        userRepository.save(user);

        String token = jwtService.generateToken(user.getId());
        logger.info("User '{}' registered successfully with id={}", user.getUsername(), user.getId());
        return new AuthResponseDto(token, user.getUsername());
    }

    public AuthResponseDto login(LoginRequestDto dto) {
        logger.info("Login attempt for user '{}'", dto.getUsername());

        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> {
                    logger.warn("Login failed: user '{}' not found", dto.getUsername());
                    return new RuntimeException("User not found");
                });

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            logger.warn("Login failed: invalid password for user '{}'", dto.getUsername());
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user.getId());
        logger.info("User '{}' logged in successfully", user.getUsername());
        return new AuthResponseDto(token, user.getUsername());
    }
}
