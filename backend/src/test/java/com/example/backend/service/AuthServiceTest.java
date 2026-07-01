package com.example.backend.service;

import com.example.backend.dto.AuthResponseDto;
import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterRequestDto;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
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
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;

    private AuthService authService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, jwtService, passwordEncoder);
        userId = UUID.randomUUID();
    }

    @Test
    void register_validData_savesUserAndReturnsToken() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setUsername("newuser");
        dto.setEmail("new@example.com");
        dto.setPassword("plainPassword");

        when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPassword");
        // simulate the DB assigning an id on save
        doAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(userId);
            return u;
        }).when(userRepository).save(any(User.class));
        when(jwtService.generateToken(userId)).thenReturn("jwt-token");

        AuthResponseDto result = authService.register(dto);

        assertThat(result.getToken()).isEqualTo("jwt-token");
        assertThat(result.getUsername()).isEqualTo("newuser");

        verify(userRepository).save(argThat(u ->
                u.getUsername().equals("newuser")
                        && u.getEmail().equals("new@example.com")
                        && u.getPasswordHash().equals("hashedPassword")));
    }

    @Test
    void login_correctCredentials_returnsToken() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setUsername("testuser");
        dto.setPassword("plainPassword");

        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");
        user.setPasswordHash("hashedPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("plainPassword", "hashedPassword")).thenReturn(true);
        when(jwtService.generateToken(userId)).thenReturn("jwt-token");

        AuthResponseDto result = authService.login(dto);

        assertThat(result.getToken()).isEqualTo("jwt-token");
        assertThat(result.getUsername()).isEqualTo("testuser");
    }

    @Test
    void login_unknownUsername_throwsException() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setUsername("ghost");
        dto.setPassword("whatever");

        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void login_wrongPassword_throwsException() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setUsername("testuser");
        dto.setPassword("wrongPassword");

        User user = new User();
        user.setId(userId);
        user.setUsername("testuser");
        user.setPasswordHash("hashedPassword");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid password");

        verify(jwtService, never()).generateToken(any());
    }
}
