import { Component, OnInit } from '@angular/core';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InscriptionService } from '../../../services/inscription.service';

@Component({
  selector: 'app-dashboard-organisateur',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-organisateur.component.html',
  styleUrls: ['./dashboard-organisateur.component.css']
})
export class DashboardOrganisateurComponent implements OnInit {
  user: any;
  evenements: Evenement[] = [];
  statistiques: any = {};
  loading = false;

  constructor(
    private evenementService: EvenementService,
    private inscriptionService: InscriptionService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.loadData();
    }
  }

  loadData() {
    this.loading = true;
    
    // Charger mes événements
    this.evenementService.getMesEvenements(this.user.id).subscribe({
      next: (data) => {
        this.evenements = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });

    // Charger statistiques
    this.evenementService.getStatistiques(this.user.id).subscribe({
      next: (data) => {
        this.statistiques = data;
      }
    });
  }

  refreshDashboard() {
    this.loadData();
  }

  getStatutColor(statut: string): string {
    const colors: any = {
      'AVENIR': 'info',
      'ENCOURS': 'success',
      'TERMINE': 'secondary',
      'ANNULE': 'danger'
    };
    return colors[statut] || 'info';
  }

  getTypeLabel(type: string): string {
    const labels: any = {
      'CONFERENCE': 'Conférence',
      'WORKSHOP': 'Workshop',
      'SEMINAIRE': 'Séminaire',
      'FORMATION': 'Formation',
      'AUTRE': 'Autre'
    };
    return labels[type] || type;
  }

  getProgressPercentage(event: Evenement): number {
    if (!event.capaciteMax || event.capaciteMax === 0) return 0;
    return Math.round((event.nombreInscrits || 0) / event.capaciteMax * 100);
  }

  exportData() {
    console.log('Exporting data...');
    alert('Fonction d\'export à implémenter');
  }
}