package com.gerement.gestion_evenements.dto;

import com.gerement.gestion_evenements.model.TypeEvenement;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateEvenementDTO {
    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 200, message = "Le titre ne peut pas dépasser 200 caractères")
    private String titre;
    
    @Size(max = 2000, message = "La description ne peut pas dépasser 2000 caractères")
    private String description;
    
    @NotNull(message = "Le type d'événement est obligatoire")
    private TypeEvenement type;
    
    @NotBlank(message = "Le lieu est obligatoire")
    private String lieu;
    
    @NotNull(message = "La date de début est obligatoire")
    @Future(message = "La date de début doit être dans le futur")
    private LocalDateTime dateDebut;
    
    @NotNull(message = "La date de fin est obligatoire")
    private LocalDateTime dateFin;
    
    @NotNull(message = "La capacité maximale est obligatoire")
    @Min(value = 1, message = "La capacité doit être au moins de 1")
    private Integer capaciteMax;
    
    @NotNull(message = "L'ID de l'organisateur est obligatoire")
    private Long organisateurId;
    
    private List<String> documents;
    private String imageUrl;
    private String videoUrl;
    private String programme;
    private String planSalle;
}