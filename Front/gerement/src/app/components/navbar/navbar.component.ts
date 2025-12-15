import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { NotificationsComponent } from '../notifications/notifications.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, NotificationsComponent, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  user: any;
  notificationsCount = 0;
  showNotifications = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.loadNotificationsCount();
    }
  }

  loadNotificationsCount() {
    this.notificationService.getNotificationsNonLues(this.user.id).subscribe(
      (notifications) => {
        this.notificationsCount = notifications.length;
      }
    );
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isOrganisateur(): boolean {
    const role = this.user?.role;
    return role === 'ORGANIZER' || role === 'ADMIN';
  }

  isParticipant(): boolean {
    const role = this.user?.role;
    return role === 'PARTICIPANT';
  }

  getUserInitials(): string {
    if (!this.user) return 'U';
    const first = this.user.prenom?.[0] || '';
    const last = this.user.nom?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  }

  getUserRole(): string {
    if (!this.user) return '';
    const roles: { [key: string]: string } = {
      'ORGANIZER': 'Organisateur',
      'ADMIN': 'Administrateur',
      'PARTICIPANT': 'Participant'
    };
    return roles[this.user.role] || this.user.role;
  }
}