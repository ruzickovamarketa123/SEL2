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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private UserService userService;

    private UUID userId;
    private User existingUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
        userId = UUID.randomUUID();

        existingUser = new User();
        existingUser.setId(userId);
        existingUser.setUsername("oldname");
        existingUser.setEmail("old@example.com");
        existingUser.setPasswordHash("old-hash");
    }

    @Test
    void updateProfile_userNotFound_throwsException() {
        UpdateUserDto dto = new UpdateUserDto();
        dto.setUsername("newname");

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfile(userId, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_updatesUsernameAndEmail() {
        UpdateUserDto dto = new UpdateUserDto();
        dto.setUsername("newname");
        dto.setEmail("new@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));

        userService.updateProfile(userId, dto);

        assertThat(existingUser.getUsername()).isEqualTo("newname");
        assertThat(existingUser.getEmail()).isEqualTo("new@example.com");
        verify(userRepository).save(existingUser);
    }

    @Test
    void updateProfile_blankFields_areIgnored() {
        UpdateUserDto dto = new UpdateUserDto();
        dto.setUsername("   ");
        dto.setEmail("");

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));

        userService.updateProfile(userId, dto);

        assertThat(existingUser.getUsername()).isEqualTo("oldname");
        assertThat(existingUser.getEmail()).isEqualTo("old@example.com");
        verify(userRepository).save(existingUser);
    }

    @Test
    void updateProfile_passwordProvided_getsHashedBeforeSaving() {
        UpdateUserDto dto = new UpdateUserDto();
        dto.setPassword("new-plaintext");

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode("new-plaintext")).thenReturn("new-hash");

        userService.updateProfile(userId, dto);

        assertThat(existingUser.getPasswordHash()).isEqualTo("new-hash");
    }

    @Test
    void updateProfile_noPasswordProvided_leavesHashUnchanged() {
        UpdateUserDto dto = new UpdateUserDto();
        dto.setUsername("newname");

        when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));

        userService.updateProfile(userId, dto);

        assertThat(existingUser.getPasswordHash()).isEqualTo("old-hash");
        verifyNoInteractions(passwordEncoder);
    }
}