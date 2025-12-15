import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  @Input() userId!: number;
  notifications: Notification[] = [];
  loading = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getMesNotifications(this.userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
        this.loading = false;
      }
    });
  }

  marquerCommeLue(notification: Notification) {
    if (!notification.lu && notification.id) {
      this.notificationService.marquerCommeLue(notification.id, this.userId).subscribe({
        next: () => {
          notification.lu = true;
        }
      });
    }
  }

  marquerToutesLues() {
    this.notificationService.marquerToutesLues(this.userId).subscribe({
      next: () => {
        this.notifications.forEach(n => n.lu = true);
      }
    });
  }

  supprimerNotification(notification: Notification) {
    if (notification.id) {
      this.notificationService.supprimerNotification(notification.id, this.userId).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
        }
      });
    }
  }

  getIcone(type: string): string {
    const icones: any = {
      'CONFIRMATION_INSCRIPTION': '✅',
      'ANNULATION_INSCRIPTION': '❌',
      'MODIFICATION_EVENEMENT': '✏️',
      'ANNULATION_EVENEMENT': '🚫',
      'RAPPEL_EVENEMENT': '⏰',
      'INFO_GENERALE': 'ℹ️'
    };
    return icones[type] || 'ℹ️';
  }
}