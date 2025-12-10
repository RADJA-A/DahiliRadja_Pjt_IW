package com.gerement.gestion_inscriptione.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationClient {
    
    private final RestTemplate restTemplate;
    
    public void envoyerConfirmationInscription(Long userId, Long evenementId, Long inscriptionId) {
        try {
            String url = "http://localhost:8083/api/notifications/confirmation-inscription" +
                "?userId=" + userId +
                "&evenementId=" + evenementId +
                "&titreEvenement=Événement" +
                "&inscriptionId=" + inscriptionId;
            
            restTemplate.postForEntity(url, null, Void.class);
            log.info("Notification envoyée à l'utilisateur {}", userId);
        } catch (Exception e) {
            log.error("Erreur envoi notification: {}", e.getMessage());
        }
    }
    
    public void envoyerAnnulationInscription(Long userId, Long evenementId) {
        try {
            String url = "http://localhost:8083/api/notifications/annulation-inscription" +
                "?userId=" + userId +
                "&evenementId=" + evenementId +
                "&titreEvenement=Événement";
            
            restTemplate.postForEntity(url, null, Void.class);
            log.info("Notification annulation envoyée");
        } catch (Exception e) {
            log.error("Erreur envoi notification: {}", e.getMessage());
        }
    }
}