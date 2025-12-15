import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { InscriptionService, Inscription } from '../../../services/inscription.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-participants-evenement',
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './participants-evenement.component.html',
  styleUrls: ['./participants-evenement.component.css']
})
export class ParticipantsEvenementComponent implements OnInit {
  evenementId!: number;
  evenement?: Evenement;
  participants: Inscription[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private evenementService: EvenementService,
    private inscriptionService: InscriptionService
  ) {}

  ngOnInit() {
    this.evenementId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // Charger l'événement
    this.evenementService.getEvenementById(this.evenementId).subscribe({
      next: (data) => {
        this.evenement = data;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });

    // Charger les participants
    this.inscriptionService.getParticipants(this.evenementId).subscribe({
      next: (data) => {
        this.participants = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  exporterListe() {
    // Créer un CSV simple
    let csv = 'ID Participant,Date Inscription\n';
    this.participants.forEach(p => {
      csv += `${p.userId},${p.dateInscription}\n`;
    });

    // Télécharger
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${this.evenement?.titre}.csv`;
    a.click();
  }
}