import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { InscriptionService, Inscription } from '../../../services/inscription.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-participants-evenement',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './participants-evenement.component.html',
  styleUrls: ['./participants-evenement.component.css']
})
export class ParticipantsEvenementComponent implements OnInit {
  evenementId!: number;
  evenement?: Evenement;
  participants: Inscription[] = [];
  loading = false;
  exportLoading = false;

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
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });

    // Charger les participants
    this.inscriptionService.getParticipants(this.evenementId).subscribe({
      next: (data) => {
        this.participants = data;
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  getProgressPercentage(): number {
    if (!this.evenement?.capaciteMax || this.evenement.capaciteMax === 0) return 0;
    const inscrits = this.evenement.nombreInscrits || 0;
    return Math.round((inscrits / this.evenement.capaciteMax) * 100);
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'AVENIR': 'À venir',
      'ENCOURS': 'En cours',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  }

  getStatusClass(statut: string): string {
    return statut || 'AVENIR';
  }

  exporterListe(format: 'csv' | 'pdf' = 'csv') {
    if (this.participants.length === 0) {
      alert('Aucun participant à exporter');
      return;
    }

    this.exportLoading = true;

    if (format === 'csv') {
      // Créer un CSV plus complet
      let csv = 'Nom,Prenom,Email,Téléphone,Date Inscription\n';
      
      this.participants.forEach(p => {
        // Utilisez les vraies données si disponibles
        const nom = p.nom || 'N/A';
        const prenom = p.prenom || 'N/A';
        const email = p.email || 'N/A';
        const telephone = p.telephone || 'N/A';
        const date = p.dateInscription ? new Date(p.dateInscription).toLocaleString() : 'N/A';
        
        csv += `${nom},${prenom},${email},${telephone},${date}\n`;
      });

      // Télécharger
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `participants-${this.evenement?.titre.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }

    setTimeout(() => {
      this.exportLoading = false;
      alert(`Liste exportée en ${format.toUpperCase()} avec succès !`);
    }, 500);
  }

  refreshList() {
    this.loadData();
  }
}