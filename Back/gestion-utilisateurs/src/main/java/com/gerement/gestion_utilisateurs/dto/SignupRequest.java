package com.gerement.gestion_utilisateurs.dto;
import com.gerement.gestion_utilisateurs.model.Role;
import lombok.Data;

@Data
public class SignupRequest {
     private String nom;
    private String prenom;
    private String email;
    private String password;
    private Role role;
}
