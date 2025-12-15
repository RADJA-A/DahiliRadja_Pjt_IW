import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InscriptionService, Inscription } from '../../../services/inscription.service';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface InscriptionAvecEvenement extends Inscription {
  evenement?: Evenement;
}

@Component({
  selector: 'app-mes-inscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mes-inscriptions.component.html',
  styleUrls: ['./mes-inscriptions.component.css'],
  providers: [DatePipe]
})
export class MesInscriptionsComponent implements OnInit {
  user: any;
  inscriptions: InscriptionAvecEvenement[] = [];
  loading = false;
  errorMessage: string = '';

  constructor(
    private inscriptionService: InscriptionService,
    private evenementService: EvenementService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    // Vérification SSR-safe pour localStorage
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

    this.inscriptionService.getMesInscriptions(this.user.id).subscribe({
      next: (inscriptions) => {
        if (inscriptions.length === 0) {
          this.inscriptions = [];
          this.loading = false;
          return;
        }

        // Charger les événements associés
        const requests = inscriptions.map(inscription =>
          this.evenementService.getEvenementById(inscription.evenementId).pipe(
            catchError(error => {
              console.error(`Erreur chargement événement ${inscription.evenementId}:`, error);
              return of(null); // Retourne null en cas d'erreur
            })
          )
        );

        forkJoin(requests).subscribe({
          next: (evenements) => {
            this.inscriptions = inscriptions.map((inscription, index) => ({
              ...inscription,
              evenement: evenements[index]
            }));
            this.loading = false;
          },
          error: (err) => {
            console.error('Erreur lors du chargement des événements:', err);
            this.errorMessage = 'Impossible de charger les détails des événements';
            this.inscriptions = inscriptions;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des inscriptions:', err);
        this.errorMessage = 'Impossible de charger vos inscriptions';
        this.loading = false;
      }
    });
  }

  seDesinscrire(inscription: InscriptionAvecEvenement) {
    const titre = inscription.evenement?.titre || 'cet événement';
    const confirmation = confirm(`Êtes-vous sûr de vouloir vous désinscrire de "${titre}" ?`);
    
    if (!confirmation) return;
    
    if (!inscription.id) {
      alert('Erreur: Inscription non identifiable');
      return;
    }

    this.inscriptionService.desinscrire(inscription.id).subscribe({
      next: () => {
        alert('✅ Désinscription réussie');
        this.inscriptions = this.inscriptions.filter(i => i.id !== inscription.id);
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

  // Méthode pour obtenir l'image selon le type d'événement
  getEventImage(type: string): string {
    const typeUpper = type?.toUpperCase() || '';
    
    // CONFERENCE, FORMATION et SEMINAIRE -> image 2
    if (['CONFERENCE', 'FORMATION', 'SEMINAIRE'].includes(typeUpper)) {
      return '/2.jpg';
    }
    
    // JOURNEE_SCIENTIFIQUE et JOURNEE_CULTURELLE -> image 3
    if (['JOURNEE_SCIENTIFIQUE', 'JOURNEE_CULTURELLE'].includes(typeUpper)) {
      return '/3.jpg';
    }
    
    // MARRIAGE -> image unique (4)
    if (typeUpper === 'MARRIAGE') {
      return '/4.jpg';
    }
    
    // FESTIVAL, ATELIER et CONCERT -> image 5
    if (['FESTIVAL', 'ATELIER', 'CONCERT'].includes(typeUpper)) {
      return '/5.jpg';
    }
    
    // AUTRE -> image 6
    if (typeUpper === 'AUTRE') {
      return '/6.jpg';
    }
    
    // Par défaut retourne l'image 2
    return '/2.jpg';
  }

  // Méthode pour obtenir l'emoji selon le type
  getTypeEmoji(type: string): string {
    const emojis: any = {
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
    return emojis[type?.toUpperCase()] || '📌';
  }

  getStatutColor(statut: string): string {
    const colors: any = {
      'AVENIR': 'info',
      'ENCOURS': 'success',
      'TERMINE': 'secondary',
      'ANNULE': 'danger',
      'COMPLET': 'warning'
    };
    return colors[statut] || 'info';
  }

  isEventPassed(dateDebut: string): boolean {
    if (!dateDebut) return false;
    return new Date(dateDebut) < new Date();
  }

  getFormattedDate(date: string | Date): string {
    if (!date) return 'Date non disponible';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  getProgressPercentage(event: Evenement | undefined): number {
    if (!event?.capaciteMax || event.capaciteMax === 0) return 0;
    const inscrits = event.nombreInscrits || 0;
    return Math.round((inscrits / event.capaciteMax) * 100);
  }
}