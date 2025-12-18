package com.gerement.gestion_inscriptione.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationClient {
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public void envoyerConfirmationInscription(Long userId, Long evenementId, Long inscriptionId) {
        try {
            // 1. Récupérer le titre réel de l'événement
            String titreEvenement = getTitreEvenement(evenementId);
            
            // 2. Envoyer la notification avec le vrai titre
            String url = "http://localhost:8083/api/notifications/confirmation-inscription" +
                "?userId=" + userId +
                "&evenementId=" + evenementId +
                "&titreEvenement=" + encodeUrl(titreEvenement) +
                "&inscriptionId=" + inscriptionId;
            
            restTemplate.postForEntity(url, null, Void.class);
            log.info("Notification envoyée à l'utilisateur {} pour l'événement '{}'", userId, titreEvenement);
        } catch (Exception e) {
            log.error("Erreur envoi notification: {}", e.getMessage(), e);
        }
    }
    
    public void envoyerAnnulationInscription(Long userId, Long evenementId) {
        try {
            // Récupérer le titre réel de l'événement
            String titreEvenement = getTitreEvenement(evenementId);
            
            String url = "http://localhost:8083/api/notifications/annulation-inscription" +
                "?userId=" + userId +
                "&evenementId=" + evenementId +
                "&titreEvenement=" + encodeUrl(titreEvenement);
            
            restTemplate.postForEntity(url, null, Void.class);
            log.info("Notification annulation envoyée pour l'événement '{}'", titreEvenement);
        } catch (Exception e) {
            log.error("Erreur envoi notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Notifie l'organisateur qu'un nouveau participant s'est inscrit
     */
    public void notifierOrganisateurNouvelInscrit(Long organisateurId, Long evenementId, String titreEvenement, Integer nombreInscrits) {
        try {
            String url = "http://localhost:8083/api/notifications/organisateur/nouvel-inscrit" +
                "?organisateurId=" + organisateurId +
                "&evenementId=" + evenementId +
                "&titreEvenement=" + encodeUrl(titreEvenement) +
                "&nombreInscrits=" + nombreInscrits;
            
            log.info("📤 Notification organisateur (nouvel inscrit): {}", url);
            restTemplate.postForEntity(url, null, Void.class);
            log.info("✅ Notification organisateur envoyée");
            
        } catch (Exception e) {
            log.error("❌ Erreur notification organisateur (nouvel inscrit): {}", e.getMessage());
            // Ne pas throw - ne pas bloquer l'inscription
        }
    }
    
    /**
     * Notifie l'organisateur qu'un participant s'est désinscrit
     */
    public void notifierOrganisateurDesinscription(Long organisateurId, Long evenementId, String titreEvenement, Integer nombreInscrits) {
        try {
            String url = "http://localhost:8083/api/notifications/organisateur/desinscription" +
                "?organisateurId=" + organisateurId +
                "&evenementId=" + evenementId +
                "&titreEvenement=" + encodeUrl(titreEvenement) +
                "&nombreInscrits=" + nombreInscrits;
            
            log.info("📤 Notification organisateur (désinscription): {}", url);
            restTemplate.postForEntity(url, null, Void.class);
            log.info("✅ Notification organisateur envoyée");
            
        } catch (Exception e) {
            log.error("❌ Erreur notification organisateur (désinscription): {}", e.getMessage());
            // Ne pas throw - ne pas bloquer la désinscription
        }
    }
    
    // Méthode pour récupérer l'organisateur d'un événement
    public Long getOrganisateurId(Long evenementId) {
        try {
            String evenementUrl = "http://localhost:8082/api/evenements/" + evenementId;
            ResponseEntity<String> response = restTemplate.getForEntity(evenementUrl, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                Long organisateurId = root.path("organisateurId").asLong();
                
                if (organisateurId != null && organisateurId > 0) {
                    log.info("✅ Organisateur trouvé: {} pour événement {}", organisateurId, evenementId);
                    return organisateurId;
                }
            }
            log.warn("⚠️ Organisateur non trouvé pour événement {}", evenementId);
            return null;
        } catch (Exception e) {
            log.error("❌ Erreur récupération organisateur: {}", e.getMessage());
            return null;
        }
    }
    
    private String getTitreEvenement(Long evenementId) {
        try {
            String evenementUrl = "http://localhost:8082/api/evenements/" + evenementId;
            ResponseEntity<String> response = restTemplate.getForEntity(evenementUrl, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String titre = root.path("titre").asText();
                
                if (titre != null && !titre.isEmpty()) {
                    return titre;
                }
            }
            log.warn("Impossible de récupérer le titre pour l'événement {}, utilisation par défaut", evenementId);
            return "Événement ID: " + evenementId;
        } catch (Exception e) {
            log.error("Erreur récupération titre événement {}: {}", evenementId, e.getMessage());
            return "Événement ID: " + evenementId;
        }
    }
    
    private String encodeUrl(String text) {
        try {
            return java.net.URLEncoder.encode(text, "UTF-8");
        } catch (Exception e) {
            log.error("Erreur encodage URL: {}", e.getMessage());
            return text;
        }
    }
}