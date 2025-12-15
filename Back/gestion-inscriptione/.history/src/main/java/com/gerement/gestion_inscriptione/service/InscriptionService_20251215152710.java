package com.gerement.gestion_inscriptione.service;

import com.gerement.gestion_inscriptione.dto.CreateInscriptionDTO;
import com.gerement.gestion_inscriptione.dto.InscriptionDTO;
import com.gerement.gestion_inscriptione.model.Inscription;
import com.gerement.gestion_inscriptione.repository.InscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InscriptionService {
    
    private final InscriptionRepository inscriptionRepository;
    
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
        
        return convertToDTO(saved);
    }
    
    // Se désinscrire d'un événement
    public void desinscrire(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
            .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        
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
    
    // Vérifier si un utilisateur est inscrit à un événement
    public boolean verifierInscription(Long userId, Long evenementId) {
        return inscriptionRepository.existsByUserIdAndEvenementId(userId, evenementId);
    }
    
    private InscriptionDTO convertToDTO(Inscription inscription) {
        InscriptionDTO dto = new InscriptionDTO();
        dto.setId(inscription.getId());
        dto.setUserId(inscription.getUserId());
        dto.setEvenementId(inscription.getEvenementId());
        return dto;
    }
}