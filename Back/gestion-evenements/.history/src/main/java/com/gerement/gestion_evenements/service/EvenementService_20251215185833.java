package com.gerement.gestion_evenements.service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gerement.gestion_evenements.dto.CreateEvenementDTO;
import com.gerement.gestion_evenements.dto.EvenementDTO;
import com.gerement.gestion_evenements.dto.EvenementSearchCriteria;
import com.gerement.gestion_evenements.dto.StatistiquesDTO;
import com.gerement.gestion_evenements.dto.UpdateEvenementDTO;
import com.gerement.gestion_evenements.exception.EvenementNotFoundException;
import com.gerement.gestion_evenements.exception.UnauthorizedException;
import com.gerement.gestion_evenements.model.Evenements;
import com.gerement.gestion_evenements.model.StatutEvenement;
import com.gerement.gestion_evenements.model.TypeEvenement;
import com.gerement.gestion_evenements.repository.EvenementRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
@Transactional
public class EvenementService {

    private final EvenementRepository evenementRepository;

    private StatutEvenement determineStatut(LocalDateTime dateDebut, LocalDateTime dateFin) {
        LocalDateTime now = LocalDateTime.now();
        
        if (dateDebut.isAfter(now)) {
            return StatutEvenement.AVENIR;
        } else if (dateDebut.isBefore(now) && dateFin.isAfter(now)) {
            return StatutEvenement.ENCOURS;
        } else {
            return StatutEvenement.TERMINE;
        }
    }

    public EvenementDTO creatEvenement (CreateEvenementDTO dto){
        validateDates(dto.getDateDebut(), dto.getDateFin());
        Evenements evenement = new Evenements();
        evenement.setTitre(dto.getTitre());  
        evenement.setType(dto.getType());
        evenement.setLieu(dto.getLieu());
        evenement.setDateDebut(dto.getDateDebut());
        evenement.setDateFin(dto.getDateFin());
        evenement.setCapaciteMax(dto.getCapaciteMax());
        evenement.setOrganisateurId(dto.getOrganisateurId());
        evenement.setDocuments(dto.getDocuments());
        evenement.setImageUrl(dto.getImageUrl());
        evenement.setVideoUrl(dto.getVideoUrl());
        evenement.setProgramme(dto.getProgramme());
        evenement.setPlanSalle(dto.getPlanSalle()); 
        Evenements saved = evenementRepository.save(evenement);
        return convertToDTO(saved); }


         public EvenementDTO updateEvenement(Long id, UpdateEvenementDTO dto, Long userId) {
        Evenements evenement = evenementRepository.findById(id)
            .orElseThrow(() -> new EvenementNotFoundException("Événement non trouvé avec l'ID: " + id));
        
        if (!evenement.getOrganisateurId().equals(userId)) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à modifier cet événement");
        }
        
        if (dto.getTitre() != null) evenement.setTitre(dto.getTitre());
        if (dto.getType() != null) evenement.setType(dto.getType());
        if (dto.getLieu() != null) evenement.setLieu(dto.getLieu());
        
        if (dto.getDateDebut() != null && dto.getDateFin() != null) {
            validateDates(dto.getDateDebut(), dto.getDateFin());
            evenement.setDateDebut(dto.getDateDebut());
            evenement.setDateFin(dto.getDateFin());
        }
        
        if (dto.getCapaciteMax() != null) evenement.setCapaciteMax(dto.getCapaciteMax());
        if (dto.getStatut() != null) evenement.setStatut(dto.getStatut());
        if (dto.getDocuments() != null) evenement.setDocuments(dto.getDocuments());
        if (dto.getImageUrl() != null) evenement.setImageUrl(dto.getImageUrl());
        if (dto.getVideoUrl() != null) evenement.setVideoUrl(dto.getVideoUrl());
        if (dto.getProgramme() != null) evenement.setProgramme(dto.getProgramme());
        if (dto.getPlanSalle() != null) evenement.setPlanSalle(dto.getPlanSalle());
        
        evenement.setDateModification(LocalDateTime.now());
        
        Evenements updated = evenementRepository.save(evenement);
        return convertToDTO(updated);
    }


      public void deleteEvenement(Long id, Long userId) {
        Evenements evenement = evenementRepository.findById(id)
            .orElseThrow(() -> new EvenementNotFoundException("Événement non trouvé avec l'ID: " + id));
        
        if (!evenement.getOrganisateurId().equals(userId)) {
            throw new UnauthorizedException("Vous n'êtes pas autorisé à supprimer cet événement");
        }
        
        evenementRepository.delete(evenement);
    }
    
    public EvenementDTO getEvenementById(Long id) {
        Evenements evenement = evenementRepository.findById(id)
            .orElseThrow(() -> new EvenementNotFoundException("Événement non trouvé avec l'ID: " + id));
        return convertToDTO(evenement);
    }

     public List<EvenementDTO> searchEvenements(EvenementSearchCriteria criteria) {
        TypeEvenement type = criteria.getType() != null ? TypeEvenement.valueOf(criteria.getType()) : null;
        StatutEvenement statut = criteria.getStatut() != null ? StatutEvenement.valueOf(criteria.getStatut()) : null;
        
        return evenementRepository.searchEvenements(
            criteria.getLieu(),
            criteria.getDateDebut(),
            criteria.getDateFin(),
            type,
            statut
        ).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }


     public List<EvenementDTO> getAllEvenements() {
        return evenementRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<EvenementDTO> getEvenementsByOrganisateur(Long organisateurId) {
        return evenementRepository.findByOrganisateurId(organisateurId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

     public List<EvenementDTO> searchEvenementsDtos(EvenementSearchCriteria criteria) {
        TypeEvenement type = criteria.getType() != null ? TypeEvenement.valueOf(criteria.getType()) : null;
        StatutEvenement statut = criteria.getStatut() != null ? StatutEvenement.valueOf(criteria.getStatut()) : null;
        
        return evenementRepository.searchEvenements(
            criteria.getLieu(),
            criteria.getDateDebut(),
            criteria.getDateFin(),
            type,
            statut
        ).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public void incrementerNombreInscrits(Long evenementId) {
        Evenements evenement = evenementRepository.findById(evenementId)
            .orElseThrow(() -> new EvenementNotFoundException("Événement non trouvé avec l'ID: " + evenementId));
        
        if (evenement.getNombreInscrits() >= evenement.getCapaciteMax()) {
            throw new ValidationException("L'événement a atteint sa capacité maximale");
        }
        
        evenement.setNombreInscrits(evenement.getNombreInscrits() + 1);
        
        if (evenement.getNombreInscrits().equals(evenement.getCapaciteMax())) {
            evenement.setStatut(StatutEvenement.TERMINE);
        }
        
        evenementRepository.save(evenement);
    }
    
    public void decrementerNombreInscrits(Long evenementId) {
        Evenements evenement = evenementRepository.findById(evenementId)
            .orElseThrow(() -> new EvenementNotFoundException("Événement non trouvé avec l'ID: " + evenementId));
        
        if (evenement.getNombreInscrits() > 0) {
            evenement.setNombreInscrits(evenement.getNombreInscrits() - 1);
            
            if (evenement.getStatut() == StatutEvenement.TERMINE) {
                evenement.setStatut(StatutEvenement.AVENIR);
            }
            
            evenementRepository.save(evenement);
        }
    }

     public StatistiquesDTO getStatistiques(Long organisateurId) {
        StatistiquesDTO stats = new StatistiquesDTO();
        stats.setTotalEvenements(evenementRepository.countByOrganisateurId(organisateurId));
        stats.setEvenementsAVenir(evenementRepository.countByOrganisateurIdAndStatut(organisateurId, StatutEvenement.AVENIR));
        stats.setEvenementsTermines(evenementRepository.countByOrganisateurIdAndStatut(organisateurId, StatutEvenement.TERMINE));
        stats.setEvenementsAnnules(evenementRepository.countByOrganisateurIdAndStatut(organisateurId, StatutEvenement.ANNULE));
        stats.setEvenementsEncours(evenementRepository.countByOrganisateurIdAndStatut(organisateurId, StatutEvenement.ENCOURS));
        return stats;
    }
    
   

      private void validateDates(LocalDateTime dateDebut, LocalDateTime dateFin) {
        if (dateDebut.isAfter(dateFin)) {
            throw new ValidationException("La date de début doit être avant la date de fin");
        }
        if (dateDebut.isBefore(LocalDateTime.now())) {
            throw new ValidationException("La date de début ne peut pas être dans le passé");
        }
    }

     private EvenementDTO convertToDTO(Evenements evenement) {
        EvenementDTO dto = new EvenementDTO();
        dto.setId(evenement.getId());
        dto.setTitre(evenement.getTitre());
        dto.setType(evenement.getType());
        dto.setLieu(evenement.getLieu());
        dto.setDateDebut(evenement.getDateDebut());
        dto.setDateFin(evenement.getDateFin());
        dto.setCapaciteMax(evenement.getCapaciteMax());
        dto.setNombreInscrits(evenement.getNombreInscrits());
        dto.setOrganisateurId(evenement.getOrganisateurId());
        dto.setStatut(evenement.getStatut());
        dto.setDocuments(evenement.getDocuments());
        dto.setImageUrl(evenement.getImageUrl());
        dto.setVideoUrl(evenement.getVideoUrl());
        dto.setProgramme(evenement.getProgramme());
        dto.setPlanSalle(evenement.getPlanSalle());
        dto.setDateCreation(evenement.getDateCreation());
        dto.setDateModification(evenement.getDateModification());
        dto.setPlacesDisponibles(evenement.getCapaciteMax() - evenement.getNombreInscrits());
        return dto;
    }

    
}
