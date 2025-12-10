package com.gerement.gestion_evenements.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "evenements")
@Data
public class Evenements {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

     @Column(nullable = false)
    private String titre;
    
        @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeEvenement type;
    
    @Column(nullable = false)
    private String lieu;
    
    @Column(nullable = false)
    private LocalDateTime dateDebut;
    
    @Column(nullable = false)
    private LocalDateTime dateFin;

     @Column(nullable = false)
    private Integer capaciteMax;

        @Column(nullable = false)
    private Integer nombreInscrits = 0;
    
    @Column(nullable = false)
    private Long organisateurId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutEvenement statut = StatutEvenement.AVENIR;


    @ElementCollection
    @CollectionTable(name = "evenement_documents", joinColumns = @JoinColumn(name = "evenement_id"))
    @Column(name = "document_url")
    private List<String> documents = new ArrayList<>();
    
    @Column
    private String imageUrl;
    
    @Column
    private String videoUrl;
    
    @Column
    private String programme;
    
    @Column
    private String planSalle;
    
    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();
    
    @Column(nullable = false)
    private LocalDateTime dateModification = LocalDateTime.now();
    
}
