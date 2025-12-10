package com.gerement.gestion_notifications.dto;

import com.gerement.gestion_notifications.model.TypeNotification;
import lombok.Data;
import java.time.LocalDateTime;


@Data
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String titre;
    private String message;
    private TypeNotification type;
    private Long evenementId;
    private Long inscriptionId;
    private Boolean lu;
    private LocalDateTime dateCreation;
    private LocalDateTime dateLecture;
}
