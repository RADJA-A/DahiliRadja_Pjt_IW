package com.gerement.gestion_evenements.dto;

import com.gerement.gestion_evenements.model.StatutEvenement;
import com.gerement.gestion_evenements.model.TypeEvenement;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EvenementDTO {
    private Long id;
    private String titre;
    private TypeEvenement type;
    private String lieu;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Integer capaciteMax;
    private Integer nombreInscrits;
    private Long organisateurId;
    private StatutEvenement statut;
    private List<String> documents;
    private String imageUrl;
    private String videoUrl;
    private String programme;
    private String planSalle;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
    private Integer placesDisponibles;
}