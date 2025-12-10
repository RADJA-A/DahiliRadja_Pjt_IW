package com.gerement.gestion_evenements.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.gerement.gestion_evenements.model.StatutEvenement;
import com.gerement.gestion_evenements.model.TypeEvenement;

import lombok.Data;

@Data
public class UpdateEvenementDTO {
     private String titre;
    private String description;
    private TypeEvenement type;
    private String lieu;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Integer capaciteMax;
    private StatutEvenement statut;
    private List<String> documents;
    private String imageUrl;
    private String videoUrl;
    private String programme;
    private String planSalle;
}
