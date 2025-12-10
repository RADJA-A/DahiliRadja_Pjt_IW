package com.gerement.gestion_evenements.repository;

import com.gerement.gestion_evenements.model.Evenements;
import com.gerement.gestion_evenements.model.StatutEvenement;
import com.gerement.gestion_evenements.model.TypeEvenement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EvenementRepository extends JpaRepository<Evenements, Long> {
    List<Evenements> findByOrganisateurId(Long organisateurId);
    List<Evenements> findByType(TypeEvenement type);
    List<Evenements> findByStatut(StatutEvenement statut);


    @Query("SELECT e FROM Evenements e WHERE " +
                "(:lieu IS NULL OR LOWER(e.lieu) LIKE LOWER(CONCAT('%', :lieu, '%'))) AND " +
           "(:dateDebut IS NULL OR e.dateDebut >= :dateDebut) AND " +
           "(:dateFin IS NULL OR e.dateFin <= :dateFin) AND " +
           "(:type IS NULL OR e.type = :type) AND " +
           "(:statut IS NULL OR e.statut = :statut)")

    List<Evenements> searchEvenements(
        @Param("lieu") String lieu,
        @Param("dateDebut") LocalDateTime dateDebut,
        @Param("dateFin") LocalDateTime dateFin,
        @Param("type") TypeEvenement type,
        @Param("statut") StatutEvenement 
        statut
    );

      @Query("SELECT COUNT(e) FROM Evenements e WHERE e.organisateurId = :organisateurId")
    Long countByOrganisateurId(@Param("organisateurId") Long organisateurId);
    
    @Query("SELECT COUNT(e) FROM Evenements e WHERE e.organisateurId = :organisateurId AND e.statut = :statut")
    Long countByOrganisateurIdAndStatut(@Param("organisateurId") Long organisateurId, @Param("statut") StatutEvenement statut);
    
    }