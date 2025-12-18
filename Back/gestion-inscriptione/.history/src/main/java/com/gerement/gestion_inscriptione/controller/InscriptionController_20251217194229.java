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
    
  
    @RequestMapping(value = "/{id}", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions(@PathVariable(required = false) Long id) {
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
                .build();
    }
    
    
    @GetMapping("/{id}")
    public ResponseEntity<InscriptionDTO> getInscriptionById(@PathVariable Long id) {
        System.out.println("GET /api/inscriptions/" + id + " appelé");
        
        // Implémentez cette méthode dans votre service
        // Pour l'instant, retournez une réponse factice ou une erreur
        try {
            // Si vous avez cette méthode dans votre service
            InscriptionDTO inscription = inscriptionService.getInscriptionById(id);
            return ResponseEntity.ok(inscription);
        } catch (Exception e) {
            System.out.println("Inscription " + id + " non trouvée: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
   
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
}