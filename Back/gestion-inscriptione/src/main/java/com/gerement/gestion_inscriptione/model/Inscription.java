package com.gerement.gestion_inscriptione.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "inscriptions")
@Data
public class Inscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long userId; 
    
    @Column(nullable = false)
    private Long evenementId; 
    
    @Column(nullable = false)
    private LocalDateTime dateInscription = LocalDateTime.now();
}