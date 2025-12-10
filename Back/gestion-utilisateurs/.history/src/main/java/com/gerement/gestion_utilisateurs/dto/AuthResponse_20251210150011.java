package com.gerement.gestion_utilisateurs.dto;
import com.gerement.gestion_utilisateurs.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String nom;
    private String prenom;
    private Role role;
    private Long id ;
}
