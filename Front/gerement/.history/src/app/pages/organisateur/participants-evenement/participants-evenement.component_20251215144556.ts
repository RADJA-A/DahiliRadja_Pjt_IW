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
  usersMap: Map<number, any> = new Map(); // Pour stocker les infos utilisateur

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
        // Optionnel: Charger les informations utilisateur pour chaque participant
        this.loadUserInfoForParticipants();
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }

  // Méthode optionnelle pour charger les informations utilisateur
  loadUserInfoForParticipants() {
    // Cette méthode dépend de si votre backend fournit les infos utilisateur
    // ou si vous devez les récupérer séparément
    const uniqueUserIds = [...new Set(this.participants.map(p => p.userId))];
    
    // Si vous avez un service User, vous pourriez faire:
    // uniqueUserIds.forEach(userId => {
    //   this.userService.getUserById(userId).subscribe(user => {
    //     this.usersMap.set(userId, user);
    //   });
    // });
    
    // Pour l'instant, on utilise les champs optionnels ou on simule
    this.participants = this.participants.map(p => ({
      ...p,
      userNom: `Utilisateur ${p.userId}`, // Simulation
      userPrenom: 'Prénom',
      userEmail: `user${p.userId}@example.com`,
      userTelephone: '01 23 45 67 89'
    }));
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
    return statut || 'AVENIR';
  }

  // Méthode pour obtenir le nom complet de l'utilisateur
  getUserName(participant: Inscription): string {
    if (participant.userNom && participant.userPrenom) {
      return `${participant.userPrenom} ${participant.userNom}`;
    }
    return `Utilisateur ${participant.userId}`;
  }

  // Méthode pour obtenir l'email
  getUserEmail(participant: Inscription): string {
    return participant.userEmail || `user${participant.userId}@example.com`;
  }

  // Méthode pour obtenir le téléphone
  getUserPhone(participant: Inscription): string {
    return participant.userTelephone || 'N/A';
  }

  exporterListe(format: 'csv' | 'pdf' = 'csv') {
    if (this.participants.length === 0) {
      alert('Aucun participant à exporter');
      return;
    }

    this.exportLoading = true;

    if (format === 'csv') {
      const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Date Inscription'];
      let csv = headers.join(',') + '\n';
      
      this.participants.forEach(p => {
        const row = [
          p.userId,
          p.userNom || 'N/A',
          p.userPrenom || 'N/A',
          this.getUserEmail(p),
          this.getUserPhone(p),
          p.dateInscription ? new Date(p.dateInscription).toLocaleString('fr-FR') : 'N/A'
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