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
    private User existingUser;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, jwtService, passwordEncoder);
        userId = UUID.randomUUID();

        existingUser = new User();
        existingUser.setId(userId);
        existingUser.setUsername("marketa");
        existingUser.setEmail("marketa@example.com");
        existingUser.setPasswordHash("hashed-secret");
    }

    // ── register ─────────────────────────────────────────────────────────────

    @Test
        // register must hash the raw password before saving — never persist plaintext
    void register_hashesPasswordBeforeSaving() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setUsername("newuser");
        dto.setEmail("new@example.com");
        dto.setPassword("plaintext");

        when(passwordEncoder.encode("plaintext")).thenReturn("hashed-plaintext");
        when(jwtService.generateToken(any())).thenReturn("token-123");

        authService.register(dto);

        verify(userRepository).save(argThat(u -> "hashed-plaintext".equals(u.getPasswordHash())));
    }

    @Test
        // the returned DTO must carry a real token and the username the caller registered with
    void register_returnsTokenAndUsername() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setUsername("newuser");
        dto.setEmail("new@example.com");
        dto.setPassword("plaintext");

        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(jwtService.generateToken(any())).thenReturn("token-123");

        AuthResponseDto result = authService.register(dto);

        assertThat(result.getToken()).isEqualTo("token-123");
        assertThat(result.getUsername()).isEqualTo("newuser");
    }

    // ── login ────────────────────────────────────────────────────────────────

    @Test
    void login_correctCredentials_returnsToken() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setUsername("marketa");
        dto.setPassword("correct-password");

        when(userRepository.findByUsername("marketa")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("correct-password", "hashed-secret")).thenReturn(true);
        when(jwtService.generateToken(userId)).thenReturn("token-abc");

        AuthResponseDto result = authService.login(dto);

        assertThat(result.getToken()).isEqualTo("token-abc");
        assertThat(result.getUsername()).isEqualTo("marketa");
    }

    @Test
        // without this check, a typo'd username would NPE instead of failing cleanly
    void login_userNotFound_throwsException() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setUsername("ghost");
        dto.setPassword("whatever");

        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found");

        verifyNoInteractions(jwtService);
    }

    @Test
        // wrong password must fail even when the username exists — and must not issue a token
    void login_wrongPassword_throwsException() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setUsername("marketa");
        dto.setPassword("wrong-password");

        when(userRepository.findByUsername("marketa")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrong-password", "hashed-secret")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid password");

        verifyNoInteractions(jwtService);
    }
}