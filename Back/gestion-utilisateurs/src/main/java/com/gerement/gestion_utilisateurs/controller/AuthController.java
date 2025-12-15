package com.gerement.gestion_utilisateurs.controller;

import com.gerement.gestion_utilisateurs.dto.AuthResponse;
import com.gerement.gestion_utilisateurs.dto.LoginRequest;
import com.gerement.gestion_utilisateurs.dto.SignupRequest;
import com.gerement.gestion_utilisateurs.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    
}