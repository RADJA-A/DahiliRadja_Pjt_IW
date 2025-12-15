import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { InscriptionService } from '../../../services/inscription.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-evenements-disponibles',
  imports: [CommonModule, FormsModule],
  templateUrl: './evenements-disponibles.component.html',
  styleUrls: ['./evenements-disponibles.component.css']
})
export class EvenementsDisponiblesComponent implements OnInit {
  user: any;
  evenements: Evenement[] = [];
  mesInscriptions: number[] = []; // IDs des événements où je suis inscrit
  loading = false;
  searchTerm = '';
  filterType = '';
  filterLieu = '';

  constructor(
    private evenementService: EvenementService,
    private inscriptionService: InscriptionService,
    private router: Router
  ) {}

  ngOnInit() {
    // Utiliser la méthode SSR-safe
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
        this.loadData();
      }
    }
  }

  loadData() {
    this.loading = true;

    // Charger tous les événements
    this.evenementService.getAllEvenements().subscribe({
      next: (data) => {
        this.evenements = data.filter(e => e.statut !== 'ANNULE' && e.statut !== 'TERMINE');
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });

    // Charger mes inscriptions
    if (this.user?.id) {
      this.inscriptionService.getMesInscriptions(this.user.id).subscribe({
        next: (data) => {
          this.mesInscriptions = data.map(i => i.evenementId);
        },
        error: (err) => {
          console.error('Erreur lors du chargement des inscriptions:', err);
        }
      });
    }
  }

  get evenementsFiltres(): Evenement[] {
    return this.evenements.filter(event => {
      const matchSearch = event.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         event.lieu.toLowerCase().includes(this.searchTerm.toLowerCase()) ;
      const matchType = !this.filterType || event.type === this.filterType;
      const matchLieu = !this.filterLieu || event.lieu.toLowerCase().includes(this.filterLieu.toLowerCase());
      return matchSearch && matchType && matchLieu;
    });
  }

  sinscrire(event: Evenement) {
    if (this.isInscrit(event.id!)) {
      alert('Vous êtes déjà inscrit à cet événement');
      return;
    }

    if (event.statut === 'COMPLET') {
      alert('Cet événement est complet');
      return;
    }

    this.inscriptionService.inscrire({
      userId: this.user.id,
      evenementId: event.id!
    }).subscribe({
      next: () => {
        alert('Inscription réussie ! 🎉');
        this.mesInscriptions.push(event.id!);
        this.loadData(); // Recharger pour mettre à jour le nombre d'inscrits
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de l\'inscription');
      }
    });
  }

  isInscrit(evenementId: number): boolean {
    return this.mesInscriptions.includes(evenementId);
  }

  voirDetails(eventId: number) {
    this.router.navigate(['/participant/evenement', eventId]);
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterType = '';
    this.filterLieu = '';
  }

  getStatutColor(statut: string): string {
    const colors: any = {
      'AVENIR': 'info',
      'ENCOURS': 'success',
      'COMPLET': 'warning',
      'TERMINE': 'secondary',
      'ANNULE': 'danger'
    };
    return colors[statut] || 'info';
  }

  getTypeEmoji(type: string): string {
    const emojis: any = {
      'CONFERENCE': '🎤',
      'FORMATION': '📚',
      'CONCERT': '🎵',
      'JOURNEE_SCIENTIFIQUE': '🔬',
      'JOURNEE_CULTURELLE': '🎨',
      'SEMINAIRE': '💼',
      'ATELIER': '🛠️',
      'MARRIAGE': '💍',
      'AUTRE': '📌'
    };
    return emojis[type] || '📌';
  }

  formatEventType(type: string): string {
    const types: any = {
      'CONFERENCE': 'Conférence',
      'FORMATION': 'Formation',
      'CONCERT': 'Concert',
      'JOURNEE_SCIENTIFIQUE': 'Journée Scientifique',
      'JOURNEE_CULTURELLE': 'Journée Culturelle',
      'SEMINAIRE': 'Séminaire',
      'ATELIER': 'Atelier',
      'MARRIAGE': 'Marriage',
      'AUTRE': 'Autre'
    };
    return types[type] || type;
  }

  getEventImage(type: string): string {
  const typeUpper = type.toUpperCase();
  
  // CONFERENCE, FORMATION et SEMINAIRE -> image 2
  if (typeUpper === 'CONFERENCE' || typeUpper === 'FORMATION' || typeUpper === 'SEMINAIRE') {
    return '/2.jpg';
  }
  
  // JOURNEE_SCIENTIFIQUE et JOURNEE_CULTURELLE -> image 3
  if (typeUpper === 'JOURNEE_SCIENTIFIQUE' || typeUpper === 'JOURNEE_CULTURELLE') {
    return '/3.jpg';
  }
  
  // MARRIAGE -> image unique (4)
  if (typeUpper === 'MARRIAGE') {
    return '/4.jpg';
  }
  
  // FESTIVAL, ATELIER et CONCERT -> image 5
  if (typeUpper === 'FESTIVAL' || typeUpper === 'ATELIER' || typeUpper === 'CONCERT') {
    return '/5.jpg';
  }
  
  // AUTRE -> image 6
  if (typeUpper === 'AUTRE') {
    return '/6.jpg';
  }
  
  // Par défaut retourne l'image 2
  return '/2.jpg';
}

  getProgressPercentage(event: Evenement): number {
    if (!event.capaciteMax || event.capaciteMax === 0) return 0;
    const inscrits = event.nombreInscrits || 0;
    return Math.round((inscrits / event.capaciteMax) * 100);
  }
}