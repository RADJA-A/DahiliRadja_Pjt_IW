import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InscriptionService, Inscription } from '../../../services/inscription.service';

@Component({
  selector: 'app-mes-inscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mes-inscriptions.component.html',
  styleUrls: ['./mes-inscriptions.component.css']
})
export class MesInscriptionsComponent implements OnInit {
  user: any;
  inscriptions: Inscription[] = [];
  loading = false;
  errorMessage: string = '';

  constructor(
    private inscriptionService: InscriptionService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
          this.loadInscriptions();
        } catch (e) {
          this.errorMessage = 'Erreur de chargement de votre profil';
          console.error('Erreur parsing user:', e);
        }
      } else {
        this.errorMessage = 'Veuillez vous connecter pour voir vos inscriptions';
      }
    }
  }

  loadInscriptions() {
    this.loading = true;
    this.errorMessage = '';

    if (!this.user?.id) {
      this.errorMessage = 'Utilisateur non identifié';
      this.loading = false;
      return;
    }

    this.inscriptionService.getMesInscriptionsEnriched(this.user.id).subscribe({
      next: (inscriptions) => {
        this.inscriptions = inscriptions;
        console.log('Inscriptions enrichies chargées:', this.inscriptions);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des inscriptions:', err);
        this.errorMessage = 'Impossible de charger vos inscriptions';
        this.loading = false;
      }
    });
  }

  seDesinscrire(inscription: Inscription) {
    const confirmation = confirm(`Êtes-vous sûr de vouloir vous désinscrire de cet événement ?`);
    
    if (!confirmation) return;
    
    if (!inscription.id) {
      alert('Erreur: Inscription non identifiable');
      return;
    }

    this.inscriptionService.desinscrire(inscription.id).subscribe({
      next: () => {
        alert('✅ Désinscription réussie');
        this.loadInscriptions(); // Recharger les inscriptions
      },
      error: (err) => {
        console.error('Erreur désinscription:', err);
        alert('❌ Erreur lors de la désinscription. Veuillez réessayer.');
      }
    });
  }

  voirDetails(evenementId: number) {
    this.router.navigate(['/participant/evenement', evenementId]);
  }

  // Méthodes pour les statistiques
  getTotalInscriptions(): number {
    return this.inscriptions.length;
  }

  getUpcomingInscriptions(): number {
    if (!this.inscriptions || this.inscriptions.length === 0) return 0;
    
    return this.inscriptions.filter((inscription: Inscription) => {
      return !this.isEventPassed(inscription.evenementDateDebut);
    }).length;
  }

  getPastInscriptions(): number {
    if (!this.inscriptions || this.inscriptions.length === 0) return 0;
    
    return this.inscriptions.filter((inscription: Inscription) => {
      return this.isEventPassed(inscription.evenementDateDebut);
    }).length;
  }

  // Méthode pour obtenir l'image selon le type d'événement
  getEventImage(type: string | undefined): string {
    const typeUpper = type?.toUpperCase() || '';
    
    if (['CONFERENCE', 'FORMATION', 'SEMINAIRE'].includes(typeUpper)) {
      return '/2.jpg';
    }
    
    if (['JOURNEE_SCIENTIFIQUE', 'JOURNEE_CULTURELLE'].includes(typeUpper)) {
      return '/3.jpg';
    }
    
    if (typeUpper === 'MARRIAGE') {
      return '/4.jpg';
    }
    
    if (['FESTIVAL', 'ATELIER', 'CONCERT'].includes(typeUpper)) {
      return '/5.jpg';
    }
    
    if (typeUpper === 'AUTRE') {
      return '/6.jpg';
    }
    
    return '/2.jpg';
  }

  // Méthode pour obtenir l'emoji selon le type
  getTypeEmoji(type: string | undefined): string {
    const emojis: Record<string, string> = {
      'CONFERENCE': '🎤',
      'FORMATION': '📚',
      'CONCERT': '🎵',
      'FESTIVAL': '🎉',
      'JOURNEE_SCIENTIFIQUE': '🔬',
      'JOURNEE_CULTURELLE': '🎨',
      'SEMINAIRE': '💼',
      'ATELIER': '🛠️',
      'MARRIAGE': '💍',
      'AUTRE': '📌'
    };
    return emojis[type?.toUpperCase() || ''] || '📌';
  }

  // Méthode pour formater le type d'événement
  formatEventType(type: string | undefined): string {
    const types: Record<string, string> = {
      'CONFERENCE': 'Conférence',
      'FORMATION': 'Formation',
      'CONCERT': 'Concert',
      'FESTIVAL': 'Festival',
      'JOURNEE_SCIENTIFIQUE': 'Journée Scientifique',
      'JOURNEE_CULTURELLE': 'Journée Culturelle',
      'SEMINAIRE': 'Séminaire',
      'ATELIER': 'Atelier',
      'MARRIAGE': 'Mariage',
      'AUTRE': 'Autre'
    };
    return types[type?.toUpperCase() || ''] || type || 'Événement';
  }

  // Méthode pour vérifier si un événement est passé
  isEventPassed(dateDebut: string | undefined): boolean {
    if (!dateDebut) return false;
    return new Date(dateDebut) < new Date();
  }

  // Formater une date
  getFormattedDate(date: string | Date | undefined): string {
    if (!date) return 'Date non disponible';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Méthode pour obtenir un titre d'événement
  getEventTitle(inscription: Inscription): string {
    return inscription.evenementTitre || `Événement #${inscription.evenementId}`;
  }

  // Méthode pour obtenir un lieu d'événement
  getEventLocation(inscription: Inscription): string {
    return inscription.evenementLieu || 'Lieu non précisé';
  }
}