import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mes-evenements',
  imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './mes-evenements.component.html',
  styleUrls: ['./mes-evenements.component.css']
})
export class MesEvenementsComponent implements OnInit {
  user: any;
  evenements: Evenement[] = [];
  loading = false;
  searchTerm = '';
  filterStatut = '';

  constructor(
    private evenementService: EvenementService,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.loadEvenements();
    }
  }

  loadEvenements() {
    this.loading = true;
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
  }

  get evenementsFiltres(): Evenement[] {
    return this.evenements.filter(event => {
      const matchSearch = event.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         event.lieu.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatut = !this.filterStatut || event.statut === this.filterStatut;
      return matchSearch && matchStatut;
    });
  }

  modifierEvenement(eventId: number) {
    this.router.navigate(['/organisateur/modifier-evenement', eventId]);
  }

  supprimerEvenement(event: Evenement) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${event.titre}" ?`)) {
      this.evenementService.deleteEvenement(event.id!, this.user.id).subscribe({
        next: () => {
          this.evenements = this.evenements.filter(e => e.id !== event.id);
          alert('Événement supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  voirParticipants(eventId: number) {
    this.router.navigate(['/organisateur/participants', eventId]);
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