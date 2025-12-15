package com.gerement.gestion_utilisateurs.controller;

import com.gerement.gestion_utilisateurs.dto.UserDTO;
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
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/batch")
    public ResponseEntity<List<UserDTO>> getUsersByIds(@RequestBody Map<String, List<Long>> request) {
        List<Long> ids = request.get("ids");
        List<UserDTO> users = userService.getUsersByIds(ids);
        return ResponseEntity.ok(users);
    }
    
    // CHANGEZ CELUI-CI : Utilisez un paramètre de requête au lieu d'un path variable
    @GetMapping("/by-email")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    // Ou bien, si vous voulez garder un chemin, encodez l'email correctement
    // @GetMapping("/email/{email}")
    // public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
    //     // Vous devez décoder l'email si nécessaire
    //     String decodedEmail = java.net.URLDecoder.decode(email, StandardCharsets.UTF_8);
    //     UserDTO user = userService.getUserByEmail(decodedEmail);
    //     return ResponseEntity.ok(user);
    // }
}