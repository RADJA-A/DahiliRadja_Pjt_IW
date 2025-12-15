package com.gerement.gestion_utilisateurs.service;

import com.gerement.gestion_utilisateurs.dto.AuthResponse;
import com.gerement.gestion_utilisateurs.dto.LoginRequest;
import com.gerement.gestion_utilisateurs.dto.SignupRequest;
import com.gerement.gestion_utilisateurs.model.User;
import com.gerement.gestion_utilisateurs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        
        // AJOUTEZ user.getId() ICI !
        return new AuthResponse(
                token,
                user.getEmail(),
                user.getNom(),
                user.getPrenom(),
                user.getRole(),
                user.getId() // ← AJOUTEZ CETTE LIGNE
        );
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(true);
        
        // Sauvegarder pour obtenir l'ID généré
        User savedUser = userRepository.save(user);
        
        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        
        // UTILISEZ savedUser.getId() POUR L'ID
        return new AuthResponse(
                token,
                savedUser.getEmail(),
                savedUser.getNom(),
                savedUser.getPrenom(),
                savedUser.getRole(),
                savedUser.getId() // ← AJOUTEZ CETTE LIGNE
        );
    }
}