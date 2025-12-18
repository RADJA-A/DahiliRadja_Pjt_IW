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
    
    //on ajoute cette ligne pour autoriser les requetes venant de l'angular
    @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
    
    // Participant : S'inscrire à un événement
    @PostMapping
    public ResponseEntity<InscriptionDTO> inscrire(@Valid @RequestBody CreateInscriptionDTO dto) {
        InscriptionDTO inscription = inscriptionService.inscrire(dto);
        return new ResponseEntity<>(inscription, HttpStatus.CREATED);
    }
    
    // Participant : Se désinscrire
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desinscrire(@PathVariable Long id) {
        inscriptionService.desinscrire(id);
        return ResponseEntity.noContent().build();
    }
    
    // Participant : Voir mes inscriptions
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InscriptionDTO>> getMesInscriptions(@PathVariable Long userId) {
        List<InscriptionDTO> inscriptions = inscriptionService.getMesInscriptions(userId);
        return ResponseEntity.ok(inscriptions);
    }
    
    // Organisateur : Voir les participants de mon événement
    @GetMapping("/evenement/{evenementId}")
    public ResponseEntity<List<InscriptionDTO>> getParticipants(@PathVariable Long evenementId) {
        List<InscriptionDTO> participants = inscriptionService.getParticipants(evenementId);
        return ResponseEntity.ok(participants);
    }
}