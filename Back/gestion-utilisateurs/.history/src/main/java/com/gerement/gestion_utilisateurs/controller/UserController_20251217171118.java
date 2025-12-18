package com.gerement.gestion_utilisateurs.controller;

import com.gerement.gestion_utilisateurs.model.User;
import com.gerement.gestion_utilisateurs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;
    
    // 1. Récupérer un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // 2. Récupérer un utilisateur par email
    @GetMapping("/by-email")
    public ResponseEntity<User> getUserByEmail(@RequestParam String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    // 3. Récupérer plusieurs utilisateurs (par liste d'IDs dans l'URL)
    @GetMapping
    public ResponseEntity<List<User>> getUsers(@RequestParam(required = false) List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            // Retourne les utilisateurs correspondant aux IDs
            List<User> users = userRepository.findAllById(ids);
            return ResponseEntity.ok(users);
        } else {
            // Si pas d'IDs, retourne tous les utilisateurs
            List<User> allUsers = userRepository.findAll();
            return ResponseEntity.ok(allUsers);
        }
    }
    
    // 4. Récupérer tous les utilisateurs (pour debug)
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
}