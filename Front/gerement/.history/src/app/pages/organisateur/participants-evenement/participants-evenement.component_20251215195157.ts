import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { InscriptionService, Inscription } from '../../../services/inscription.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

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

    // ===================================================================
    // OPTION 1 : Avec appels API pour tous les utilisateurs (RECOMMANDÉ)
    // ===================================================================
    forkJoin({
      evenement: this.evenementService.getEvenementById(this.evenementId),
      participants: this.inscriptionService.getParticipantsEnriched(this.evenementId)
    }).subscribe({
      next: (data) => {
        this.evenement = data.evenement;
        this.participants = data.participants;
        console.log('✅ Données chargées:', {
          evenement: this.evenement,
          participants: this.participants
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement:', err);
        this.loading = false;
      }
    });

    // ===================================================================
    // OPTION 2 : Sans appels API (localStorage uniquement)
    // Décommenter si vous voulez tester sans backend User Service
    // ===================================================================
    /*
    this.inscriptionService.getParticipants(this.evenementId).subscribe({
      next: (inscriptions) => {
        // Enrichir manuellement avec données par défaut
        this.participants = inscriptions.map(inscription => ({
          ...inscription,
          userNom: `Participant`,
          userPrenom: `#${inscription.userId}`,
          userEmail: `participant${inscription.userId}@example.com`
       
        }));
        console.log('✅ Participants (mode simple):', this.participants);
      },
      error: (err) => {
        console.error('❌ Erreur chargement participants:', err);
      }
    });

    this.evenementService.getEvenementById(this.evenementId).subscribe({
      next: (evenement) => {
        this.evenement = evenement;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erreur chargement événement:', err);
        this.loading = false;
      }
    });
    */
  }

  // Méthodes d'affichage SIMPLIFIÉES
  getUserName(participant: Inscription): string {
    if (participant.userNom && participant.userPrenom) {
      return `${participant.userPrenom} ${participant.userNom}`;
    } else if (participant.userNom) {
      return participant.userNom;
    }
    return `Utilisateur ${participant.userId}`;
  }

  getNom(participant: Inscription): string {
    return participant.userNom || `Utilisateur ${participant.userId}`;
  }

  getPrenom(participant: Inscription): string {
    return participant.userPrenom || '';
  }

  getUserEmail(participant: Inscription): string {
    return participant.userEmail || `user${participant.userId}@example.com`;
  }

 

  getProgressPercentage(): number {
    if (!this.evenement?.capaciteMax || this.evenement.capaciteMax === 0) return 0;
    const inscrits = this.evenement.nombreInscrits || 0;
    return Math.round((inscrits / this.evenement.capaciteMax) * 100);
  }

  getStatusLabel(statut: string | undefined): string {
    if (!statut) return 'Non défini';
    
    const labels: { [key: string]: string } = {
      'AVENIR': 'À venir',
      'ENCOURS': 'En cours',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  }

  getStatusClass(statut: string | undefined): string {
    return statut?.toLowerCase() || 'avenir';
  }

  exporterListe(format: 'csv' | 'pdf' = 'csv') {
    if (this.participants.length === 0) {
      alert('Aucun participant à exporter');
      return;
    }

    this.exportLoading = true;

    if (format === 'csv') {
      const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone'];
      let csv = headers.join(',') + '\n';
      
      this.participants.forEach(p => {
        const row = [
          p.userId,
          p.userNom || 'N/A',
          p.userPrenom || 'N/A',
          p.userEmail || 'N/A',
          p.userTelephone || 'N/A'
        ];
        
        const escapedRow = row.map(value => `"${value}"`);
        csv += escapedRow.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const eventTitle = this.evenement?.titre 
        ? this.evenement.titre.replace(/[^a-z0-9]/gi, '-').toLowerCase() 
        : 'participants';
      a.download = `participants-${eventTitle}-${new Date().toISOString().split('T')[0]}.csv`;
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