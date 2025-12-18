package com.gerement.gestion_notifications.controller;

import com.gerement.gestion_notifications.dto.CreateNotificationDTO;
import com.gerement.gestion_notifications.dto.NotificationDTO;
import com.gerement.gestion_notifications.dto.NotificationStatsDTO;
import com.gerement.gestion_notifications.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;


@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {
    private final NotificationService notificationService;

    //on ajoute cette ligne pour autoriser les requetes venant de l'angular
  //  @CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@Valid @RequestBody CreateNotificationDTO dto) {
        NotificationDTO created = notificationService.createNotification(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/confirmation-inscription")
    public ResponseEntity<Void> envoyerConfirmationInscription(
            @RequestParam Long userId,
            @RequestParam Long evenementId,
            @RequestParam String titreEvenement,
            @RequestParam Long inscriptionId) {
        notificationService.envoyerNotificationConfirmationInscription(userId, evenementId, titreEvenement, inscriptionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/annulation-inscription")
    public ResponseEntity<Void> envoyerAnnulationInscription(
            @RequestParam Long userId,
            @RequestParam Long evenementId,
            @RequestParam String titreEvenement) {
        notificationService.envoyerNotificationAnnulationInscription(userId, evenementId, titreEvenement);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/modification-evenement")
    public ResponseEntity<Void> envoyerModificationEvenement(
            @RequestParam Long userId,
            @RequestParam Long evenementId,
            @RequestParam String titreEvenement,
            @RequestParam String details) {
        notificationService.envoyerNotificationModificationEvenement(userId, evenementId, titreEvenement, details);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/annulation-evenement")
    public ResponseEntity<Void> envoyerAnnulationEvenement(
            @RequestParam Long userId,
            @RequestParam Long evenementId,
            @RequestParam String titreEvenement) {
        notificationService.envoyerNotificationAnnulationEvenement(userId, evenementId, titreEvenement);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/rappel-evenement")
    public ResponseEntity<Void> envoyerRappelEvenement(
            @RequestParam Long userId,
            @RequestParam Long evenementId,
            @RequestParam String titreEvenement,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateEvenement) {
        notificationService.envoyerNotificationRappelEvenement(userId, evenementId, titreEvenement, dateEvenement);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUser(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByUser(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}/non-lues")
    public ResponseEntity<List<NotificationDTO>> getNotificationsNonLues(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsNonLues(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/user/{userId}/lues")
    public ResponseEntity<List<NotificationDTO>> getNotificationsLues(@PathVariable Long userId) {
        List<NotificationDTO> notifications = notificationService.getNotificationsLues(userId);
        return ResponseEntity.ok(notifications);
    }
    
    @PutMapping("/{id}/marquer-lue")
    public ResponseEntity<NotificationDTO> marquerCommeLue(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        NotificationDTO notification = notificationService.marquerCommeLue(id, userId);
        return ResponseEntity.ok(notification);
    }
    
    @PutMapping("/user/{userId}/marquer-toutes-lues")
    public ResponseEntity<Void> marquerToutesCommeLues(@PathVariable Long userId) {
        notificationService.marquerToutesCommeLues(userId);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerNotification(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        notificationService.supprimerNotification(id, userId);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/user/{userId}/supprimer-lues")
    public ResponseEntity<Void> supprimerNotificationsLues(@PathVariable Long userId) {
        notificationService.supprimerNotificationsLues(userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/user/{userId}/statistiques")
    public ResponseEntity<NotificationStatsDTO> getStatistiques(@PathVariable Long userId) {
        NotificationStatsDTO stats = notificationService.getStatistiques(userId);
        return ResponseEntity.ok(stats);
    }
    
}
