package com.gerement.gestion_evenements.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Future;
import com.gerement.gestion_evenements.model.TypeEvenement;

import lombok.Data;

@Data
public class CreateEvenementDTO {
    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 200, message = "Le titre ne peut pas dépasser 200 caractères")
    private String titre;
    
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
    private Long organisateurId;
    private List<String> documents;
    private String imageUrl;
    private String videoUrl;
    private String programme;
    private String planSalle;
}
