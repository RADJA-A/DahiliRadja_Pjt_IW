package com.gerement.gestion_inscriptione.service;

import com.gerement.gestion_inscriptione.client.EvenementClient;
import com.gerement.gestion_inscriptione.client.NotificationClient;
import com.gerement.gestion_inscriptione.dto.CreateInscriptionDTO;
import com.gerement.gestion_inscriptione.dto.InscriptionDTO;
import com.gerement.gestion_inscriptione.model.Inscription;
import com.gerement.gestion_inscriptione.repository.InscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
@Slf4j
public class InscriptionService {
    
    private final InscriptionRepository inscriptionRepository;
    private final EvenementRepository evenementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService; // Ajoutez cette injection
    
    public InscriptionDTO creerInscription(CreateInscriptionDTO dto) {
        log.info("Création d'inscription pour l'utilisateur {} à l'événement {}", 
                 dto.getUserId(), dto.getEvenementId());
        
        // Vérifier si l'événement existe
        Evenement evenement = evenementRepository.findById(dto.getEvenementId())
            .orElseThrow(() -> new EvenementNotFoundException("Événement non trouvé"));
        
        // Vérifier si l'utilisateur existe
        Utilisateur utilisateur = utilisateurRepository.findById(dto.getUserId())
            .orElseThrow(() -> new UtilisateurNotFoundException("Utilisateur non trouvé"));
        
        // Vérifier les places disponibles
        long nombreInscrits = inscriptionRepository.countByEvenementId(dto.getEvenementId());
        if (nombreInscrits >= evenement.getCapaciteMax()) {
            throw new CapaciteMaxAtteinteException("Capacité maximale atteinte");
        }
        
        // Créer l'inscription
        Inscription inscription = new Inscription();
        inscription.setUser(utilisateur);
        inscription.setEvenement(evenement);
        inscription.setDateInscription(LocalDateTime.now());
        inscription.setStatut(StatutInscription.CONFIRMEE);
        
        Inscription saved = inscriptionRepository.save(inscription);
        log.info("Inscription créée avec l'ID {}", saved.getId());
        
        // =========== NOTIFICATION POUR LE PARTICIPANT ===========
        notificationService.envoyerNotificationConfirmationInscription(
            utilisateur.getId(),
            evenement.getId(),
            evenement.getTitre(),
            saved.getId()
        );
        
        // =========== NOTIFICATION POUR L'ORGANISATEUR ===========
        notificationService.envoyerNotificationNouvelInscrit(
            evenement.getOrganisateurId(), // L'ID de l'organisateur
            evenement.getId(),
            evenement.getTitre(),
            utilisateur.getNom() + " " + utilisateur.getPrenom() // Nom du participant
        );
        
        log.info("Notifications envoyées au participant et à l'organisateur");
        
        return convertToDTO(saved);
    }
    
    // Se désinscrire d'un événement
    public void desinscrire(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
            .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        
        // Décrémenter le nombre d'inscrits
        evenementClient.decrementerInscrits(inscription.getEvenementId());
        
        // Envoyer notification
        notificationClient.envoyerAnnulationInscription(inscription.getUserId(), inscription.getEvenementId());
        
        // Supprimer l'inscription
        inscriptionRepository.delete(inscription);
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
    
    private InscriptionDTO convertToDTO(Inscription inscription) {
        InscriptionDTO dto = new InscriptionDTO();
        dto.setId(inscription.getId());
        dto.setUserId(inscription.getUserId());
        dto.setEvenementId(inscription.getEvenementId());
        return dto;
    }
}