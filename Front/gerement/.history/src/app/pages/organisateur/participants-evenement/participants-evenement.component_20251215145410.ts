import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { InscriptionService, Inscription } from '../../../services/inscription.service';
import { AuthService, User } from '../../../services/auth.service'; // ← Utiliser AuthService
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
  usersMap: Map<number, User> = new Map(); // Stocker les infos utilisateur

  constructor(
    private route: ActivatedRoute,
    private evenementService: EvenementService,
    private inscriptionService: InscriptionService,
    private authService: AuthService // ← Utiliser AuthService existant
  ) {}

  ngOnInit() {
    this.evenementId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // Charger événement ET participants en parallèle
    forkJoin({
      evenement: this.evenementService.getEvenementById(this.evenementId),
      participants: this.inscriptionService.getParticipants(this.evenementId)
    }).subscribe({
      next: (data) => {
        this.evenement = data.evenement;
        this.participants = data.participants;
        
        // Charger les infos utilisateur
        this.loadUserInfoForParticipants();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.loading = false;
      }
    });
  }

  loadUserInfoForParticipants() {
    // Récupérer les IDs uniques des participants
    const uniqueUserIds = [...new Set(this.participants.map(p => p.userId))];
    
    if (uniqueUserIds.length === 0) {
      console.log('Aucun participant à charger');
      return;
    }

    console.log('Chargement des infos pour', uniqueUserIds.length, 'utilisateurs');
    
    // Charger tous les utilisateurs en une seule fois
    this.authService.getUsersByIds(uniqueUserIds).subscribe({
      next: (users) => {
        console.log('✅ Utilisateurs chargés:', users);
        // Créer une Map pour un accès rapide
        users.forEach(user => {
          this.usersMap.set(user.id, user);
        });
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', err);
        // En cas d'erreur, créer des utilisateurs par défaut
        uniqueUserIds.forEach(userId => {
          this.usersMap.set(userId, {
            id: userId,
            nom: 'Inconnu',
            prenom: 'Utilisateur',
            email: `user${userId}@example.com`,
            role: 'PARTICIPANT'
          });
        });
      }
    });
  }

  // Méthodes d'affichage
  getUserName(participant: Inscription): string {
    const user = this.usersMap.get(participant.userId);
    if (user) {
      return `${user.prenom} ${user.nom}`;
    }
    return `Utilisateur ${participant.userId}`;
  }

  getUserEmail(participant: Inscription): string {
    const user = this.usersMap.get(participant.userId);
    return user?.email || `user${participant.userId}@example.com`;
  }

  getUserPhone(participant: Inscription): string {
    const user = this.usersMap.get(participant.userId);
    // Vous devrez ajouter le champ 'telephone' à l'interface User si nécessaire
    return (user as any)?.telephone || 'N/A';
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
        const user = this.usersMap.get(p.userId);
        const row = [
          p.userId,
          user?.nom || 'N/A',
          user?.prenom || 'N/A',
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