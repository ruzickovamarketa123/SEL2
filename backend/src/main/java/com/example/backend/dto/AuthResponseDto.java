package com.example.backend.dto;

public class AuthResponseDto {
    private String token;
    private String username;

    public AuthResponseDto(String token, String username) {
        this.token = token;
        this.username = username;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
}