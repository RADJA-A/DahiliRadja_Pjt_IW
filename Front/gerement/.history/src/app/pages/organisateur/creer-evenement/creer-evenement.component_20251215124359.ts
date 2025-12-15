import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-creer-evenement',
  imports: [CommonModule, RouterLink, FormsModule],
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
    'MARRIAGE'
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

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'CONFERENCE': 'Conférence 🎤',
      'FORMATION': 'Formation 📚',
      'CONCERT': 'Concert 🎵',
      'JOURNEE_SCIENTIFIQUE': 'Journée Scientifique 🔬',
      'JOURNEE_CULTURELLE': 'Journée Culturelle 🎨',
      'SEMINAIRE': 'Séminaire 💼',
      'ATELIER': 'Atelier 🛠️',
      'AUTRE': 'Autre 📌'
    };
    return labels[type] || type;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.evenementService.createEvenement(this.evenement).subscribe({
      next: (data) => {
        this.loading = false;
        alert('Événement créé avec succès ! 🎉');
        this.router.navigate(['/organisateur/mes-evenements']);
      },
      error: (err) => {
        this.loading = false;
        alert('Erreur lors de la création');
      }
    });
  }

  validateForm(): boolean {
    if (!this.evenement.titre?.trim()) {
      alert('Le titre est obligatoire');
      return false;
    }
    
    if (!this.evenement.lieu?.trim()) {
      alert('Le lieu est obligatoire');
      return false;
    }
    
    if (!this.evenement.dateDebut || !this.evenement.dateFin) {
      alert('Les dates sont obligatoires');
      return false;
    }
    
    const debut = new Date(this.evenement.dateDebut);
    const fin = new Date(this.evenement.dateFin);
    
    if (debut >= fin) {
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