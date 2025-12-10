package com.gerement.gestion_notifications.dto;

import com.gerement.gestion_notifications.model.TypeNotification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateNotificationDTO {
    @NotNull(message = "L'ID de l'utilisateur est obligatoire")
    private Long userId;
    
    @NotBlank(message = "Le titre est obligatoire")
    private String titre;
    
    @NotBlank(message = "Le message est obligatoire")
    private String message;
    
    @NotNull(message = "Le type de notification est obligatoire")
    private TypeNotification type;
    
    private Long evenementId;
    private Long inscriptionId;
}
