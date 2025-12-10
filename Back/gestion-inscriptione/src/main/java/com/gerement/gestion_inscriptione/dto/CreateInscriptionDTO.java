package com.gerement.gestion_inscriptione.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateInscriptionDTO {
    @NotNull(message = "L'ID de l'utilisateur est obligatoire")
    private Long userId;
    
    @NotNull(message = "L'ID de l'événement est obligatoire")
    private Long evenementId;
}