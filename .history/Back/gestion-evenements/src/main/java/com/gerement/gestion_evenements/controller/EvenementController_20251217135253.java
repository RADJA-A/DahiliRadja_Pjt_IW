package com.gerement.gestion_evenements.controller;

import com.gerement.gestion_evenements.dto.*;
import com.gerement.gestion_evenements.service.EvenementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/evenements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EvenementController {
    
    private final EvenementService evenementService;
    
    @PostMapping
    public ResponseEntity<EvenementDTO> createEvenement(@Valid @RequestBody CreateEvenementDTO dto) {
        EvenementDTO created = evenementService.creatEvenement(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    //on ajoute cette ligne pour autoriser les requetes venant de l'angular
    @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
    
    @PutMapping("/{id}")
    public ResponseEntity<EvenementDTO> updateEvenement(
            @PathVariable Long id,
            @RequestBody UpdateEvenementDTO dto,
            @RequestHeader("User-Id") Long userId) {
        EvenementDTO updated = evenementService.updateEvenement(id, dto, userId);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvenement(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        evenementService.deleteEvenement(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EvenementDTO> getEvenementById(@PathVariable Long id) {
        EvenementDTO evenement = evenementService.getEvenementById(id);
        return ResponseEntity.ok(evenement);
    }
    
    @GetMapping
    public ResponseEntity<List<EvenementDTO>> getAllEvenements() {
        List<EvenementDTO> evenements = evenementService.getAllEvenements();
        return ResponseEntity.ok(evenements);
    }
    
    @GetMapping("/organisateur/{organisateurId}")
    public ResponseEntity<List<EvenementDTO>> getEvenementsByOrganisateur(@PathVariable Long organisateurId) {
        List<EvenementDTO> evenements = evenementService.getEvenementsByOrganisateur(organisateurId);
        return ResponseEntity.ok(evenements);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<EvenementDTO>> searchEvenements(
            @RequestParam(required = false) String motCle,
            @RequestParam(required = false) String lieu,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String statut) {
        
        EvenementSearchCriteria criteria = new EvenementSearchCriteria();
        criteria.setLieu(lieu);
        criteria.setType(type);
        criteria.setStatut(statut);
        
        List<EvenementDTO> evenements = evenementService.searchEvenements(criteria);
        return ResponseEntity.ok(evenements);
    }
    
    @PostMapping("/{id}/incrementer-inscrits")
    public ResponseEntity<Void> incrementerInscrits(@PathVariable Long id) {
        evenementService.incrementerNombreInscrits(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/decrementer-inscrits")
    public ResponseEntity<Void> decrementerInscrits(@PathVariable Long id) {
        evenementService.decrementerNombreInscrits(id);
        return ResponseEntity.ok().build();
    }
    
        @GetMapping("/statistiques/{organisateurId}")
    public ResponseEntity<StatistiquesDTO> getStatistiques(@PathVariable Long organisateurId) {
        StatistiquesDTO stats = evenementService.getStatistiques(organisateurId);
        return ResponseEntity.ok(stats);
    }


}