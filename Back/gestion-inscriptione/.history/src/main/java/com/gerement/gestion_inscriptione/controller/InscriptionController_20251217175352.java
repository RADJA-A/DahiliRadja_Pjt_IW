package com.gerement.gestion_inscriptione.controller;

import com.gerement.gestion_inscriptione.dto.CreateInscriptionDTO;
import com.gerement.gestion_inscriptione.dto.InscriptionDTO;
import com.gerement.gestion_inscriptione.service.InscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InscriptionController {
    
    private final InscriptionService inscriptionService;
    
    // ==================== CRITIQUE ====================
    // Gestion des requêtes OPTIONS pour DELETE (CORS pré-vol)
    @RequestMapping(value = "/{id}", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions(@PathVariable(required = false) Long id) {
        System.out.println("OPTIONS pré-vol reçu pour DELETE /api/inscriptions/" + id);
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                .header("Access-Control-Max-Age", "3600")
                .build();
    }
    
    // ==================== ROUTES NORMALES ====================
    @PostMapping
    public ResponseEntity<InscriptionDTO> inscrire(@Valid @RequestBody CreateInscriptionDTO dto) {
        InscriptionDTO inscription = inscriptionService.inscrire(dto);
        return new ResponseEntity<>(inscription, HttpStatus.CREATED);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desinscrire(@PathVariable Long id) {
        System.out.println("DELETE /api/inscriptions/" + id + " appelé");
        inscriptionService.desinscrire(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InscriptionDTO>> getMesInscriptions(@PathVariable Long userId) {
        List<InscriptionDTO> inscriptions = inscriptionService.getMesInscriptions(userId);
        return ResponseEntity.ok(inscriptions);
    }
    
    @GetMapping("/evenement/{evenementId}")
    public ResponseEntity<List<InscriptionDTO>> getParticipants(@PathVariable Long evenementId) {
        List<InscriptionDTO> participants = inscriptionService.getParticipants(evenementId);
        return ResponseEntity.ok(participants);
    }
    
    // ==================== AJOUTER POUR DEBUG ====================
    @GetMapping("/{id}")
    public ResponseEntity<InscriptionDTO> getInscriptionById(@PathVariable Long id) {
        System.out.println("DEBUG: GET /api/inscriptions/" + id + " appelé");
        // À implémenter dans votre service si nécessaire
        return ResponseEntity.notFound().build();
    }
}