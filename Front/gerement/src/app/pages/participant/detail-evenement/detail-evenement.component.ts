import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { InscriptionService } from '../../../services/inscription.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detail-evenement',
  imports: [CommonModule, FormsModule],
  templateUrl: './detail-evenement.component.html',
  styleUrls: ['./detail-evenement.component.css']
})
export class DetailEvenementComponent implements OnInit {
  user: any;
  evenement?: Evenement;
  loading = false;
  isInscrit = false;
  inscriptionId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evenementService: EvenementService,
    private inscriptionService: InscriptionService
  ) {}

  ngOnInit() {
    // Vérification SSR-safe
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (e) {
          console.error('Erreur parsing user:', e);
        }
      }
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvenement(id);
    this.checkInscription(id);
  }

  loadEvenement(id: number) {
    this.loading = true;
    this.evenementService.getEvenementById(id).subscribe({
      next: (data) => {
        this.evenement = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Événement non trouvé');
        this.router.navigate(['/participant/evenements']);
      }
    });
  }

  checkInscription(evenementId: number) {
    if (!this.user?.id) return;
    
    this.inscriptionService.getMesInscriptions(this.user.id).subscribe({
      next: (inscriptions) => {
        const inscription = inscriptions.find(i => i.evenementId === evenementId);
        this.isInscrit = !!inscription;
        this.inscriptionId = inscription?.id;
      },
      error: (err) => {
        console.error('Erreur vérification inscription:', err);
      }
    });
  }

  sinscrire() {
    if (!this.user?.id) {
      alert('Veuillez vous connecter pour vous inscrire');
      this.router.navigate(['/login']);
      return;
    }

    if (this.isInscrit) {
      alert('Vous êtes déjà inscrit à cet événement');
      return;
    }

    if (this.evenement?.statut === 'COMPLET') {
      alert('❌ Cet événement est complet');
      return;
    }

    if (this.evenement?.statut === 'ANNULE') {
      alert('❌ Cet événement a été annulé');
      return;
    }

    const evenementId = this.evenement?.id;
    if (!evenementId) {
      alert('Erreur: Événement non identifié');
      return;
    }

    this.inscriptionService.inscrire({
      userId: this.user.id,
      evenementId: evenementId
    }).subscribe({
      next: () => {
        alert('✅ Inscription réussie ! 🎉');
        this.isInscrit = true;
        this.loadEvenement(evenementId); // Recharger pour mettre à jour le nombre d'inscrits
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('❌ Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    });
  }

  seDesinscrire() {
    if (!this.inscriptionId) {
      alert('Erreur: Inscription non trouvée');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir vous désinscrire de cet événement ?')) {
      return;
    }

    this.inscriptionService.desinscrire(this.inscriptionId).subscribe({
      next: () => {
        alert('✅ Désinscription réussie');
        this.isInscrit = false;
        this.inscriptionId = undefined;
        if (this.evenement?.id) {
          this.loadEvenement(this.evenement.id);
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('❌ Erreur lors de la désinscription');
      }
    });
  }

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

  getStatutColor(statut: string): string {
    const colors: Record<string, string> = {
      'AVENIR': 'info',
      'ENCOURS': 'success',
      'TERMINE': 'secondary',
      'ANNULE': 'danger',
      'COMPLET': 'warning'
    };
    return colors[statut] || 'info';
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      'AVENIR': 'À venir',
      'ENCOURS': 'En cours',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé',
      'COMPLET': 'Complet'
    };
    return labels[statut] || statut;
  }

  getProgressPercentage(): number {
    if (!this.evenement?.capaciteMax || this.evenement.capaciteMax === 0) return 0;
    const inscrits = this.evenement.nombreInscrits || 0;
    return Math.round((inscrits / this.evenement.capaciteMax) * 100);
  }

  getPlacesRestantes(): number {
    const capacite = this.evenement?.capaciteMax || 0;
    const inscrits = this.evenement?.nombreInscrits || 0;
    return Math.max(0, capacite - inscrits);
  }

  isEventPassed(): boolean {
    if (!this.evenement?.dateDebut) return false;
    return new Date(this.evenement.dateDebut) < new Date();
  }

  getFormattedDate(date: string | Date | undefined): string {
    if (!date) return 'Date non disponible';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getFormattedTime(date: string | Date | undefined): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDuration(): string {
    if (!this.evenement?.dateDebut || !this.evenement?.dateFin) return '';
    
    const start = new Date(this.evenement.dateDebut);
    const end = new Date(this.evenement.dateFin);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (durationHours < 1) {
      return `${Math.round(durationHours * 60)} minutes`;
    } else if (durationHours < 24) {
      return `${Math.round(durationHours)} heures`;
    } else {
      return `${Math.round(durationHours / 24)} jours`;
    }
  }
}