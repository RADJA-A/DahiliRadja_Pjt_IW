package com.gerement.gestion_notifications.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId; // ID de l'utilisateur destinataire
    
    @Column(nullable = false)
    private String titre;
    
    @Column(length = 1000, nullable = false)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeNotification type;
    
    @Column
    private Long evenementId; // ID de l'événement concerné (si applicable)
    
    @Column
    private Long inscriptionId; // ID de l'inscription concernée (si applicable)
    
    @Column(nullable = false)
    private Boolean lu = false;
    
    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();
    
    @Column
    private LocalDateTime dateLecture;
    
}
