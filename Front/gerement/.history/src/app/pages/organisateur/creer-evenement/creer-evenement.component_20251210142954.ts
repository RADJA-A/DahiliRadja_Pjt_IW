import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-creer-evenement',
    imports: [CommonModule,RouterLink,FormsModule],
  templateUrl: './creer-evenement.component.html',
  styleUrls: ['./creer-evenement.component.css']
})
export class CreerEvenementComponent implements OnInit {
  user: any;
  loading = false;
  
  evenement: Evenement = {
    titre: '',
    type: 'CONFERENCE',
    lieu: '',
    dateDebut: '',
    dateFin: '',
    capaciteMax: 50,
    organisateurId: 0,
    imageUrl: '',
    programme: ''
  };

  types = [
    'CONFERENCE',
    'FORMATION',
    'CONCERT',
    'JOURNEE_SCIENTIFIQUE',
    'JOURNEE_CULTURELLE',
    'SEMINAIRE',
    'ATELIER',
    'AUTRE'
  ];

  constructor(
    private evenementService: EvenementService,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
      this.evenement.organisateurId = this.user.id;
    }
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.evenementService.createEvenement(this.evenement).subscribe({
      next: (data) => {
        alert('Événement créé avec succès ! 🎉');
        this.router.navigate(['/organisateur/mes-evenements']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de la création de l\'événement');
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.evenement.titre.trim()) {
      alert('Le titre est obligatoire');
      return false;
    }
    if (!this.evenement.lieu.trim()) {
      alert('Le lieu est obligatoire');
      return false;
    }
    if (!this.evenement.dateDebut) {
      alert('La date de début est obligatoire');
      return false;
    }
    if (!this.evenement.dateFin) {
      alert('La date de fin est obligatoire');
      return false;
    }
    if (new Date(this.evenement.dateDebut) >= new Date(this.evenement.dateFin)) {
      alert('La date de fin doit être après la date de début');
      return false;
    }
    if (this.evenement.capaciteMax < 1) {
      alert('La capacité doit être au moins de 1 personne');
      return false;
    }
    return true;
  }
}