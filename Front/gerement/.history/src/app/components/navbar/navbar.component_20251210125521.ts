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
    const userStr = localStorage.getItem('user');
    console.log('Navbar init - User string from localStorage:', userStr); // Debug
    
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        console.log('Navbar - Parsed user object:', this.user); // Debug
        console.log('Navbar - User role:', this.user?.role); // Debug
        console.log('Navbar - isOrganisateur():', this.isOrganisateur()); // Debug
        console.log('Navbar - isParticipant():', this.isParticipant()); // Debug
        
        this.loadNotificationsCount();
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }

  loadNotificationsCount() {
    if (this.user?.id) {
      this.notificationService.getNotificationsNonLues(this.user.id).subscribe(
        (notifications) => {
          this.notificationsCount = notifications.length;
        },
        (error) => {
          console.error('Error loading notifications:', error);
        }
      );
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isOrganisateur(): boolean {
    const role = this.user?.role;
    console.log('isOrganisateur check - role:', role); // Debug
    return role === 'ORGANIZER' || role === 'ADMIN';
  }

  isParticipant(): boolean {
    const role = this.user?.role;
    console.log('isParticipant check - role:', role); // Debug
    return role === 'PARTICIPANT';
  }
}