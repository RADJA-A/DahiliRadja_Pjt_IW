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
  errorMessage: string = '';
  unreadCount = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    console.log('NotificationsComponent initialized with userId:', this.userId);
    this.loadNotifications();
  }

  loadNotifications() {
    if (!this.userId || this.userId <= 0) {
      console.error('Invalid userId:', this.userId);
      this.errorMessage = 'User ID is required';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    console.log('Loading notifications for user:', this.userId);
    this.notificationService.getMesNotifications(this.userId).subscribe({
      next: (data) => {
        console.log('Notifications loaded successfully:', data);
        this.notifications = data || [];
        this.updateUnreadCount();
        this.loading = false;
        
        if (this.notifications.length === 0) {
          console.log('No notifications found for this user');
        }
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.errorMessage = 'Erreur lors du chargement des notifications';
        this.loading = false;
        this.notifications = [];
        this.unreadCount = 0;
      },
      complete: () => {
        console.log('Notifications loading complete');
      }
    });
  }

  updateUnreadCount(): void {
    this.unreadCount = this.calculateUnreadCount();
  }

  calculateUnreadCount(): number {
    if (!this.notifications || this.notifications.length === 0) {
      return 0;
    }
    return this.notifications.filter(notification => !notification.lu).length;
  }

  marquerCommeLue(notification: Notification) {
    if (!notification.lu && notification.id && this.userId) {
      this.notificationService.marquerCommeLue(notification.id, this.userId).subscribe({
        next: () => {
          console.log('Notification marked as read:', notification.id);
          notification.lu = true;
          this.updateUnreadCount();
        },
        error: (err) => {
          console.error('Error marking notification as read:', err);
        }
      });
    }
  }

  marquerToutesLues() {
    if (!this.userId) {
      console.error('Cannot mark all as read: userId is not set');
      return;
    }
    
    this.notificationService.marquerToutesLues(this.userId).subscribe({
      next: () => {
        console.log('All notifications marked as read');
        this.notifications.forEach(n => n.lu = true);
        this.unreadCount = 0;
      },
      error: (err) => {
        console.error('Error marking all notifications as read:', err);
      }
    });
  }

  supprimerNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    
    if (notification.id && this.userId) {
      this.notificationService.supprimerNotification(notification.id, this.userId).subscribe({
        next: () => {
          console.log('Notification deleted:', notification.id);
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          this.updateUnreadCount();
        },
        error: (err) => {
          console.error('Error deleting notification:', err);
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