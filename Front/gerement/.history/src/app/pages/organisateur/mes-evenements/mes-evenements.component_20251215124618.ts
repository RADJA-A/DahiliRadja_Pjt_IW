import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mes-evenements',
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './mes-evenements.component.html',
  styleUrls: ['./mes-evenements.component.css']
})
export class MesEvenementsComponent implements OnInit {
  user: any;
  evenements: Evenement[] = [];
  loading = false;
  searchTerm = '';

  constructor(
    private evenementService: EvenementService,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.loadEvenements();
    }
  }

  loadEvenements() {
    this.loading = true;
    this.evenementService.getMesEvenements(this.user.id).subscribe({
      next: (data) => {
        this.evenements = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  get evenementsFiltres(): Evenement[] {
    return this.evenements.filter(event => {
      return event.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             event.lieu.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
             event.type?.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  modifierEvenement(eventId: number) {
    this.router.navigate(['/organisateur/modifier-evenement', eventId]);
  }

  supprimerEvenement(event: Evenement) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${event.titre}" ?`)) {
      this.evenementService.deleteEvenement(event.id!, this.user.id).subscribe({
        next: () => {
          this.evenements = this.evenements.filter(e => e.id !== event.id);
          alert('Événement supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  voirParticipants(eventId: number) {
    this.router.navigate(['/organisateur/participants', eventId]);
  }

  getStatutColor(statut: string): string {
    const colors: any = {
      'AVENIR': 'info',
      'ENCOURS': 'success',
      'TERMINE': 'secondary',
      'ANNULE': 'danger'
    };
    return colors[statut] || 'info';
  }

  getProgressPercentage(event: Evenement): number {
    if (!event.capaciteMax || event.capaciteMax === 0) return 0;
    const nombreInscrits = event.nombreInscrits || 0;
    return Math.round((nombreInscrits / event.capaciteMax) * 100);
  }

  // Méthode pour obtenir l'image selon le type d'événement
  getEventImage(type: string | undefined): string {
    if (!type) return '/2.jpg'; // Image par défaut
    
    const typeUpper = type.toUpperCase();
    
    // CONFIANCE, FORMATION et SEMINAIRE -> image 2
    if (typeUpper === 'CONFERENCE' || typeUpper === 'FORMATION' || typeUpper === 'SEMINAIRE') {
      return '/2.jpg';
    }
    
    // JOURNEE_SCIENTIFIQUE et JOURNEE_CULTURELLE -> image 3
    if (typeUpper === 'JOURNEE_SCIENTIFIQUE' || typeUpper === 'JOURNEE_CULTURELLE') {
      return '/3.jpg';
    }
    
    // MARRIAGE -> image unique (4)
    if (typeUpper === 'MARRIAGE') {
      return '/4.jpg';
    }
    
    // FESTIVAL, ATELIER et CONCERT -> image 5
    if (typeUpper === 'FESTIVAL' || typeUpper === 'ATELIER' || typeUpper === 'CONCERT') {
      return '/5.jpg';
    }
    
    // AUTRE -> image 6
    if (typeUpper === 'AUTRE') {
      return '/6.jpg';
    }
    
    // Par défaut retourne l'image 2
    return '/2.jpg';
  }

  // Méthode pour formater le type d'événement
  formatEventType(type: string | undefined): string {
    if (!type) return 'Autre';
    
    const typeMap: any = {
      'CONFERENCE': 'Conférence',
      'FORMATION': 'Formation',
      'SEMINAIRE': 'Séminaire',
      'JOURNEE_SCIENTIFIQUE': 'Journée Scientifique',
      'JOURNEE_CULTURELLE': 'Journée Culturelle',
      'MARRIAGE': 'Mariage',
      'FESTIVAL': 'Festival',
      'ATELIER': 'Atelier',
      'CONCERT': 'Concert',
      'AUTRE': 'Autre'
    };
    
    return typeMap[type.toUpperCase()] || type;
  }
}