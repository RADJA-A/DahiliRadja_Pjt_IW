package com.gerement.gestion_evenements.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EvenementSearchCriteria {
     private String lieu;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private String type;
    private String statut;
}
