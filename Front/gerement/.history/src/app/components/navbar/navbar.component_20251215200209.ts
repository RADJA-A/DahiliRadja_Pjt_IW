import { Component, OnInit, HostListener } from '@angular/core';
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
  isScrolled = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUser();
    this.setupScrollListener();
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
    // Add ripple effect
    this.createRipple();
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

  goToProfile() {
    this.router.navigate(['/profil']);
  }

  goToSettings() {
    this.router.navigate(['/parametres']);
  }

  private createRipple() {
    const btn = document.querySelector('.notification-btn');
    if (btn) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      btn.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  }

  private setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 10;
    });
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper') && !target.closest('app-notifications')) {
      this.showNotifications = false;
    }
  }
}