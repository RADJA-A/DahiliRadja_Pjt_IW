package com.gerement.gestion_utilisateurs.dto;
import lombok.Data;
@Data
public class LoginRequest {
    private String email;
    private String password;
}
