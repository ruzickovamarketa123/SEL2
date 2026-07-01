package com.example.backend.service;

import com.example.backend.dto.UpdateUserDto;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private UserService userService;

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
        userId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("oldHash");
    }

    @Test
    void findById_missingUser_throwsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void updateProfile_allFieldsProvided_updatesEverything() {
        UpdateUserDto dto = new UpdateUserDto();
        dto.setUsername("newname");
        dto.setEmail("new@example.com");
        dto.setPassword("newPassword");

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("newHash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateProfile(userId, dto);

        assertThat(result.getUsername()).isEqualTo("newname");
        assertThat(result.getEmail()).isEqualTo("new@example.com");
        assertThat(result.getPasswordHash()).isEqualTo("newHash");
        verify(userRepository).save(testUser);
    }

    @Test
    void updateProfile_blankFields_leavesExistingValuesUnchanged() {
        UpdateUserDto dto = new UpdateUserDto();
        dto.setUsername("  ");
        dto.setEmail(null);
        dto.setPassword("");

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateProfile(userId, dto);

        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getPasswordHash()).isEqualTo("oldHash");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void updateProfile_missingUser_throwsException() {
        UpdateUserDto dto = new UpdateUserDto();
        dto.setUsername("newname");

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfile(userId, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");

        verify(userRepository, never()).save(any());
    }
}
