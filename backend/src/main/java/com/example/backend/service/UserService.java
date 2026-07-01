package com.example.backend.service;

import com.example.backend.dto.UpdateUserDto;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private static final Logger logger = LogManager.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findById(UUID userId) {
        logger.debug("Fetching user id={}", userId);
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found with id={}", userId);
                    return new RuntimeException("User not found");
                });
    }

    /**
     * Applies a partial update to the currently logged-in user's profile.
     * Blank/null fields in the DTO are left untouched.
     */
    public User updateProfile(UUID userId, UpdateUserDto dto) {
        logger.info("Updating profile for userId={}", userId);

        User user = findById(userId);

        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            user.setUsername(dto.getUsername());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            user.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }

        User saved = userRepository.save(user);
        logger.info("Profile updated successfully for userId={}", userId);
        return saved;
    }
}
