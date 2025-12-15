package com.gerement.gestion_utilisateurs.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private boolean active;
    // Ajoutez d'autres champs si nécessaire
}