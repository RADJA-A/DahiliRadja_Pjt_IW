package com.gerement.gestion_notifications.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationStatsDTO {
    private Long totalNotifications;
    private Long notificationsNonLues;
    private Long notificationsLues;
}