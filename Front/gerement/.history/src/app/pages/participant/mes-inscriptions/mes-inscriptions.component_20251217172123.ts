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

  // Utilisez la méthode simplifiée qui retourne seulement les infos événement
  this.inscriptionService.getMesInscriptionsEvenement(this.user.id).subscribe({
    next: (inscriptions) => {
      this.inscriptions = inscriptions;
      console.log('Inscriptions avec infos événement chargées:', this.inscriptions);
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
  const titre = inscription.evenementTitre || `l'événement #${inscription.evenementId}`;
  const confirmation = confirm(`Êtes-vous sûr de vouloir vous désinscrire de "${titre}" ?`);
  
  if (!confirmation) return;
  
  // Si pas d'ID, chercher l'inscription par userId + evenementId
  if (!inscription.id) {
    console.warn('⚠️ ID d\'inscription manquant, tentative de récupération...');
    
    this.inscriptionService.isUserInscrit(this.user.id, inscription.evenementId).subscribe({
      next: (estInscrit) => {
        if (estInscrit) {
          // Récupérer toutes les inscriptions pour trouver la bonne
          this.inscriptionService.getMesInscriptions(this.user.id).subscribe({
            next: (rawInscriptions) => {
              const foundInscription = rawInscriptions.find(
                ins => ins.userId === this.user.id && ins.evenementId === inscription.evenementId
              );
              
              if (foundInscription?.id) {
                this.desinscrireAvecId(foundInscription.id);
              } else {
                alert('❌ Impossible de trouver l\'inscription');
              }
            }
          });
        }
      }
    });
    
    return;
  }

  this.desinscrireAvecId(inscription.id);
}

// Nouvelle méthode séparée
private desinscrireAvecId(inscriptionId: number) {
  this.inscriptionService.desinscrire(inscriptionId).subscribe({
    next: () => {
      alert('✅ Désinscription réussie');
      this.loadInscriptions();
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
    return this.inscriptions.filter(inscription => 
      !this.isEventPassed(inscription.evenementDateDebut)
    ).length;
  }

  getPastInscriptions(): number {
    if (!this.inscriptions || this.inscriptions.length === 0) return 0;
    return this.inscriptions.filter(inscription => 
      this.isEventPassed(inscription.evenementDateDebut)
    ).length;
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
    try {
      return new Date(dateDebut) < new Date();
    } catch (e) {
      return false;
    }
  }

  // Formater une date
  getFormattedDate(date: string | Date | undefined): string {
    if (!date) return 'Date non disponible';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  }

  // Méthode pour obtenir un titre d'événement
  getEventTitle(inscription: Inscription): string {
    return inscription.evenementTitre || `Événement #${inscription.evenementId}`;
  }

  // Méthode pour obtenir un lieu d'événement
  getEventLocation(inscription: Inscription): string {
    return inscription.evenementLieu || 'Lieu non précisé';
  }

  // Méthode pour obtenir le type d'événement
  getEventType(inscription: Inscription): string {
    return inscription.evenementType || 'Non spécifié';
  }
}