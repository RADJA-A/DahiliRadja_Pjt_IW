package com.gerement.gestion_notifications.repository;

import com.gerement.gestion_notifications.model.Notification;
import com.gerement.gestion_notifications.model.TypeNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>  {

    List<Notification> findByUserIdOrderByDateCreationDesc(Long userId);
    
    List<Notification> findByUserIdAndLuOrderByDateCreationDesc(Long userId, Boolean lu);
    
    List<Notification> findByEvenementIdOrderByDateCreationDesc(Long evenementId);
    
    List<Notification> findByUserIdAndTypeOrderByDateCreationDesc(Long userId, TypeNotification type);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.lu = false")
    Long countNotificationsNonLues(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId")
    Long countTotalNotifications(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.lu = true, n.dateLecture = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.lu = false")
    int marquerToutesCommeLues(@Param("userId") Long userId);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userId = :userId AND n.lu = true")
    int supprimerNotificationsLues(@Param("userId") Long userId);
    
}
