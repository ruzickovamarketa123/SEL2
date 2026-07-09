package com.example.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    public String generateToken(UUID userId) {
        return Jwts.builder()
                .subject(userId.toString())     //SUBJECT IS UUID, NOT USERNAME
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))        //24 HOURS EXPIRY
                .signWith(getKey())     // SIHGNED WITH HMAC IN CONFIGURATION, NOT IN CODE
                .compact();
    }

    public UUID extractUserId(String token) {
        String subject = Jwts.parser()
                .verifyWith(getKey())   //checks hmac signature
                .build()
                .parseSignedClaims(token)   //throws if signature is bad or expired
                .getPayload()
                .getSubject();  //the userid from generatetoken
        return UUID.fromString(subject);
    }

    public boolean isValid(String token) {
        try {
            extractUserId(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}

