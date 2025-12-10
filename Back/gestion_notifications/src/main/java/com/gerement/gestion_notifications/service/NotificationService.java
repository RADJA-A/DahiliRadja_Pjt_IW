package com.gerement.gestion_notifications.service;

import com.gerement.gestion_notifications.dto.CreateNotificationDTO;
import com.gerement.gestion_notifications.dto.NotificationDTO;
import com.gerement.gestion_notifications.dto.NotificationStatsDTO;
import com.gerement.gestion_notifications.exception.NotificationNotFoundException;
import com.gerement.gestion_notifications.model.Notification;
import com.gerement.gestion_notifications.model.TypeNotification;
import com.gerement.gestion_notifications.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationService {
    private final NotificationRepository notificationRepository;

     public NotificationDTO createNotification(CreateNotificationDTO dto) {
        log.info("Création d'une notification pour l'utilisateur {}", dto.getUserId());
        
        Notification notification = new Notification();
        notification.setUserId(dto.getUserId());
        notification.setTitre(dto.getTitre());
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setEvenementId(dto.getEvenementId());
        notification.setInscriptionId(dto.getInscriptionId());
        
        Notification saved = notificationRepository.save(notification);
        log.info("Notification créée avec l'ID {}", saved.getId());
        
        return convertToDTO(saved);
    }

     public void envoyerNotificationConfirmationInscription(Long userId, Long evenementId, String titreEvenement, Long inscriptionId) {
        CreateNotificationDTO dto = new CreateNotificationDTO();
        dto.setUserId(userId);
        dto.setTitre("Inscription confirmée");
        dto.setMessage("Votre inscription à l'événement \"" + titreEvenement + "\" a été confirmée avec succès.");
        dto.setType(TypeNotification.CONFIRMATION_INSCRIPTION);
        dto.setEvenementId(evenementId);
        dto.setInscriptionId(inscriptionId);
        
        createNotification(dto);
    }

    public void envoyerNotificationAnnulationInscription(Long userId, Long evenementId, String titreEvenement) {
        CreateNotificationDTO dto = new CreateNotificationDTO();
        dto.setUserId(userId);
        dto.setTitre("Inscription annulée");
        dto.setMessage("Votre inscription à l'événement \"" + titreEvenement + "\" a été annulée.");
        dto.setType(TypeNotification.ANNULATION_INSCRIPTION);
        dto.setEvenementId(evenementId);
        
        createNotification(dto);
    }


    public void envoyerNotificationModificationEvenement(Long userId, Long evenementId, String titreEvenement, String details) {
        CreateNotificationDTO dto = new CreateNotificationDTO();
        dto.setUserId(userId);
        dto.setTitre("Événement modifié");
        dto.setMessage("L'événement \"" + titreEvenement + "\" a été modifié. " + details);
        dto.setType(TypeNotification.MODIFICATION_EVENEMENT);
        dto.setEvenementId(evenementId);
        
        createNotification(dto);
    }

    public void envoyerNotificationAnnulationEvenement(Long userId, Long evenementId, String titreEvenement) {
        CreateNotificationDTO dto = new CreateNotificationDTO();
        dto.setUserId(userId);
        dto.setTitre("Événement annulé");
        dto.setMessage("L'événement \"" + titreEvenement + "\" a été annulé.");
        dto.setType(TypeNotification.ANNULATION_EVENEMENT);
        dto.setEvenementId(evenementId);
        
        createNotification(dto);
    }

     public void envoyerNotificationRappelEvenement(Long userId, Long evenementId, String titreEvenement, LocalDateTime dateEvenement) {
        CreateNotificationDTO dto = new CreateNotificationDTO();
        dto.setUserId(userId);
        dto.setTitre("Rappel : Événement à venir");
        dto.setMessage("L'événement \"" + titreEvenement + "\" aura lieu bientôt le " + dateEvenement.toString() + ".");
        dto.setType(TypeNotification.RAPPEL_EVENEMENT);
        dto.setEvenementId(evenementId);
        
        createNotification(dto);
    }

     public List<NotificationDTO> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserIdOrderByDateCreationDesc(userId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

        public List<NotificationDTO> getNotificationsNonLues(Long userId) {
        return notificationRepository.findByUserIdAndLuOrderByDateCreationDesc(userId, false).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<NotificationDTO> getNotificationsLues(Long userId) {
        return notificationRepository.findByUserIdAndLuOrderByDateCreationDesc(userId, true).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }


     public NotificationDTO marquerCommeLue(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new NotificationNotFoundException("Notification non trouvée avec l'ID: " + notificationId));
        
        if (!notification.getUserId().equals(userId)) {
            throw new NotificationNotFoundException("Cette notification ne vous appartient pas");
        }
        
        notification.setLu(true);
        notification.setDateLecture(LocalDateTime.now());
        
        Notification updated = notificationRepository.save(notification);
        log.info("Notification {} marquée comme lue", notificationId);
        
        return convertToDTO(updated);
    }
    
    public void marquerToutesCommeLues(Long userId) {
        int count = notificationRepository.marquerToutesCommeLues(userId);
        log.info("{} notifications marquées comme lues pour l'utilisateur {}", count, userId);
    }
    
    public void supprimerNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new NotificationNotFoundException("Notification non trouvée avec l'ID: " + notificationId));
        
        if (!notification.getUserId().equals(userId)) {
            throw new NotificationNotFoundException("Cette notification ne vous appartient pas");
        }
        
        notificationRepository.delete(notification);
        log.info("Notification {} supprimée", notificationId);
    }
    
    public void supprimerNotificationsLues(Long userId) {
        int count = notificationRepository.supprimerNotificationsLues(userId);
        log.info("{} notifications lues supprimées pour l'utilisateur {}", count, userId);
    }
    
    public NotificationStatsDTO getStatistiques(Long userId) {
        Long total = notificationRepository.countTotalNotifications(userId);
        Long nonLues = notificationRepository.countNotificationsNonLues(userId);
        Long lues = total - nonLues;
        
        return new NotificationStatsDTO(total, nonLues, lues);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setTitre(notification.getTitre());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setEvenementId(notification.getEvenementId());
        dto.setInscriptionId(notification.getInscriptionId());
        dto.setLu(notification.getLu());
        dto.setDateCreation(notification.getDateCreation());
        dto.setDateLecture(notification.getDateLecture());
        return dto;
    }
    
}
