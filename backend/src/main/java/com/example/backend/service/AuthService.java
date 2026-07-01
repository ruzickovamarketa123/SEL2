package com.example.backend.service;

import com.example.backend.dto.AuthResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger logger = LogManager.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
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
        logger.info("User registered successfully: id={}, username='{}'", user.getId(), user.getUsername());
        return new AuthResponseDto(token, user.getUsername());
    }

    public AuthResponseDto login(LoginRequestDto dto) {
        logger.info("Login attempt for username '{}'", dto.getUsername());

        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> {
                    logger.warn("Login failed: no user found with username '{}'", dto.getUsername());
                    return new RuntimeException("User not found");
                });

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            logger.warn("Login failed: incorrect password for username '{}'", dto.getUsername());
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user.getId());
        logger.info("Login successful for username '{}'", dto.getUsername());
        return new AuthResponseDto(token, user.getUsername());
    }
}