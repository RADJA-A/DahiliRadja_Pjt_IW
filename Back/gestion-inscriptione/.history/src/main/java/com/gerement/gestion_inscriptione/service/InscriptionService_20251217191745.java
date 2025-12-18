package com.gerement.gestion_inscriptione.service;

import com.gerement.gestion_inscriptione.client.EvenementClient;
import com.gerement.gestion_inscriptione.client.NotificationClient;
import com.gerement.gestion_inscriptione.dto.CreateInscriptionDTO;
import com.gerement.gestion_inscriptione.dto.InscriptionDTO;
import com.gerement.gestion_inscriptione.model.Inscription;
import com.gerement.gestion_inscriptione.repository.InscriptionRepository;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class InscriptionService {
    
    private final InscriptionRepository inscriptionRepository;
    private final EvenementClient evenementClient;
    private final NotificationClient notificationClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // S'inscrire à un événement
   public InscriptionDTO inscrire(CreateInscriptionDTO dto) {
        // Vérifier si déjà inscrit
        if (inscriptionRepository.existsByUserIdAndEvenementId(dto.getUserId(), dto.getEvenementId())) {
            throw new RuntimeException("Vous êtes déjà inscrit à cet événement");
        }
        
        // Créer l'inscription
        Inscription inscription = new Inscription();
        inscription.setUserId(dto.getUserId());
        inscription.setEvenementId(dto.getEvenementId());
        
        Inscription saved = inscriptionRepository.save(inscription);
        
        // Incrémenter le nombre d'inscrits dans Événements
        evenementClient.incrementerInscrits(dto.getEvenementId());
        
        // 1. Notification PARTICIPANT
        notificationClient.envoyerConfirmationInscription(dto.getUserId(), dto.getEvenementId(), saved.getId());
        
        // 2. Notification ORGANISATEUR (NOUVEAU)
        Long organisateurId = notificationClient.getOrganisateurId(dto.getEvenementId());
        if (organisateurId != null) {
            String titreEvenement = getTitreEvenement(dto.getEvenementId());
            // Récupérer le nouveau nombre d'inscrits après incrémentation
            Integer nouveauNombreInscrits = getNombreInscrits(dto.getEvenementId());
            
            notificationClient.notifierOrganisateurNouvelInscrit(
                organisateurId,
                dto.getEvenementId(),
                titreEvenement,
                nouveauNombreInscrits
            );
        }
        
        return convertToDTO(saved);
    }
    // Se désinscrire d'un événement
    public void desinscrire(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
            .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        
        // Récupérer les infos avant de décrémenter
        Long evenementId = inscription.getEvenementId();
        Long organisateurId = notificationClient.getOrganisateurId(evenementId);
        String titreEvenement = getTitreEvenement(evenementId);
        Integer ancienNombreInscrits = getNombreInscrits(evenementId);
        
        // Décrémenter le nombre d'inscrits
        evenementClient.decrementerInscrits(evenementId);
        
        // 1. Notification PARTICIPANT
        notificationClient.envoyerAnnulationInscription(inscription.getUserId(), evenementId);
        
        // 2. Notification ORGANISATEUR (NOUVEAU)
        if (organisateurId != null) {
            Integer nouveauNombreInscrits = ancienNombreInscrits - 1;
            
            notificationClient.notifierOrganisateurDesinscription(
                organisateurId,
                evenementId,
                titreEvenement,
                nouveauNombreInscrits
            );
        }
        
        // Supprimer l'inscription
        inscriptionRepository.delete(inscription);
    }

     // Méthode helper pour récupérer le titre
    private String getTitreEvenement(Long evenementId) {
        try {
            // Vous pouvez réutiliser la logique de NotificationClient
            // ou faire un appel direct
            String evenementUrl = "http://localhost:8082/api/evenements/" + evenementId;
            ResponseEntity<String> response = new RestTemplate().getForEntity(evenementUrl, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("titre").asText();
            }
            return "Événement ID: " + evenementId;
        } catch (Exception e) {
            return "Événement ID: " + evenementId;
        }
    }
    
    // Méthode helper pour récupérer le nombre d'inscrits
    private Integer getNombreInscrits(Long evenementId) {
        try {
            String evenementUrl = "http://localhost:8082/api/evenements/" + evenementId;
            ResponseEntity<String> response = new RestTemplate().getForEntity(evenementUrl, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("nombreInscrits").asInt();
            }
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }
    // Voir mes inscriptions
    public List<InscriptionDTO> getMesInscriptions(Long userId) {
        return inscriptionRepository.findByUserId(userId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Voir les participants d'un événement (pour organisateur)
    public List<InscriptionDTO> getParticipants(Long evenementId) {
        return inscriptionRepository.findByEvenementId(evenementId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    public InscriptionDTO getInscriptionById(Long id) {
    System.out.println("Service: Recherche inscription ID: " + id);
    
    return inscriptionRepository.findById(id)
            .map(inscription -> {
                InscriptionDTO dto = new InscriptionDTO();
                dto.setId(inscription.getId());
                dto.setUserId(inscription.getUserId());
                dto.setEvenementId(inscription.getEvenementId());
                return dto;
            })
            .orElseThrow(() -> {
                System.out.println("Inscription " + id + " non trouvée");
                return new RuntimeException("Inscription non trouvée avec ID: " + id);
            });
}
    private InscriptionDTO convertToDTO(Inscription inscription) {
        InscriptionDTO dto = new InscriptionDTO();
        dto.setId(inscription.getId());
        dto.setUserId(inscription.getUserId());
        dto.setEvenementId(inscription.getEvenementId());
        return dto;
    }
}