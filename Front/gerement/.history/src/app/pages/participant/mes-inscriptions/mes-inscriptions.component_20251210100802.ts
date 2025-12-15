import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { InscriptionService, Inscription } from '../../../services/inscription.service';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { forkJoin } from 'rxjs';

interface InscriptionAvecEvenement extends Inscription {
  evenement?: Evenement;
}

@Component({
  selector: 'app-mes-inscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule], // ← AJOUT IMPORTANT
  templateUrl: './mes-inscriptions.component.html',
  styleUrls: ['./mes-inscriptions.component.css']
})
export class MesInscriptionsComponent implements OnInit {
  user: any;
  inscriptions: InscriptionAvecEvenement[] = [];
  loading = false;

  constructor(
    private inscriptionService: InscriptionService,
    private evenementService: EvenementService,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.loadInscriptions();
    }
  }

  loadInscriptions() {
    this.loading = true;
    this.inscriptionService.getMesInscriptions(this.user.id).subscribe({
      next: (inscriptions) => {
        if (inscriptions.length === 0) {
          this.inscriptions = [];
          this.loading = false;
          return;
        }

        const requests = inscriptions.map(inscription =>
          this.evenementService.getEvenementById(inscription.evenementId)
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
            console.error('Erreur chargement événements:', err);
            this.inscriptions = inscriptions;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  seDesinscrire(inscription: InscriptionAvecEvenement) {
    const titre = inscription.evenement?.titre || 'cet événement';
    if (confirm(`Êtes-vous sûr de vouloir vous désinscrire de "${titre}" ?`)) {
      this.inscriptionService.desinscrire(inscription.id!).subscribe({
        next: () => {
          alert('Désinscription réussie');
          this.inscriptions = this.inscriptions.filter(i => i.id !== inscription.id);
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de la désinscription');
        }
      });
    }
  }

  voirDetails(evenementId: number) {
    this.router.navigate(['/participant/evenement', evenementId]);
  }

  getStatutColor(statut: string): string {
    const colors: any = {
      'A_VENIR': 'info',
      'EN_COURS': 'success',
      'TERMINE': 'secondary',
      'ANNULE': 'danger'
    };
    return colors[statut] || 'info';
  }

  isEventPassed(dateDebut: string): boolean {
    return new Date(dateDebut) < new Date();
  }
}