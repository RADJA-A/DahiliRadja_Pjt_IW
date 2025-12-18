package com.gerement.gestion_utilisateurs.controller;

import com.gerement.gestion_utilisateurs.model.User;
import com.gerement.gestion_utilisateurs.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    // Récupérer un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    // Récupérer un utilisateur par email
    @GetMapping("/by-email")
    public ResponseEntity<User> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
    
    // Récupérer plusieurs utilisateurs par leurs IDs (batch)
    @PostMapping("/batch")
    public ResponseEntity<List<User>> getUsersByIds(@RequestBody Map<String, List<Long>> request) {
        List<Long> ids = request.get("ids");
        return ResponseEntity.ok(userService.getUsersByIds(ids));
    }
    
    // Alternative pour le batch avec un paramètre simple
    @GetMapping("/batch")
    public ResponseEntity<List<User>> getUsersByIdsParam(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(userService.getUsersByIds(ids));
    }
    
    // Récupérer tous les utilisateurs (pour admin)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}