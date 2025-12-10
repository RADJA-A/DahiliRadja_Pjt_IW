package com.gerement.gestion_inscriptione.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class EvenementClient {
    
    private final RestTemplate restTemplate;
    
    public void incrementerInscrits(Long evenementId) {
        try {
            String url = "http://localhost:8082/api/evenements/" + evenementId + "/incrementer-inscrits";
            restTemplate.postForEntity(url, null, Void.class);
            log.info("Inscrits incrémentés pour événement {}", evenementId);
        } catch (Exception e) {
            log.error("Erreur communication avec Événements: {}", e.getMessage());
        }
    }
    
    public void decrementerInscrits(Long evenementId) {
        try {
            String url = "http://localhost:8082/api/evenements/" + evenementId + "/decrementer-inscrits";
            restTemplate.postForEntity(url, null, Void.class);
            log.info("Inscrits décrémentés pour événement {}", evenementId);
        } catch (Exception e) {
            log.error("Erreur communication avec Événements: {}", e.getMessage());
        }
    }
}