package com.gerement.gestion_evenements.dto;

import lombok.Data;

@Data
public class StatistiquesDTO {
    private Long totalEvenements;
    private Long evenementsAVenir;
    private Long evenementsTermines;
    private Long evenementsAnnules;
    private Long evenementsEncours;


}