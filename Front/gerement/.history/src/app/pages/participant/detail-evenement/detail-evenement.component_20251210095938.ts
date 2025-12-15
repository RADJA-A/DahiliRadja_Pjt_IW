import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { InscriptionService } from '../../../services/inscription.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detail-evenement',
    imports: [CommonModule,FormsModule],
  templateUrl: './detail-evenement.component.html',
  styleUrls: ['./detail-evenement.component.css']
})
export class DetailEvenementComponent implements OnInit {
  user: any;
  evenement?: Evenement;
  loading = false;
  isInscrit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private evenementService: EvenementService,
    private inscriptionService: InscriptionService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
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
    this.inscriptionService.getMesInscriptions(this.user.id).subscribe({
      next: (inscriptions) => {
        this.isInscrit = inscriptions.some(i => i.evenementId === evenementId);
      }
    });
  }

  sinscrire() {
    if (this.isInscrit) {
      alert('Vous êtes déjà inscrit');
      return;
    }

    if (this.evenement?.statut === 'COMPLET') {
      alert('Cet événement est complet');
      return;
    }

    this.inscriptionService.inscrire({
      userId: this.user.id,
      evenementId: this.evenement!.id!
    }).subscribe({
      next: () => {
        alert('Inscription réussie ! 🎉');
        this.isInscrit = true;
        this.loadEvenement(this.evenement!.id!); // Recharger pour mettre à jour
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de l\'inscription');
      }
    });
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
}