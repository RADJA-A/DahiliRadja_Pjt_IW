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
      
      // Définir l'ID de l'organisateur
      if (this.user && this.user.id) {
        this.evenement.organisateurId = Number(this.user.id);
      }
    }
  }

  // Convertir le type en label lisible
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
    // Valider le formulaire
    if (!this.validateForm()) {
      return;
    }

    // Vérifier que l'organisateurId est défini
    if (!this.evenement.organisateurId || this.evenement.organisateurId === 0) {
      alert('Erreur: Impossible de créer l\'événement. Veuillez vous reconnecter.');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;

    // Créer l'événement
    this.evenementService.createEvenement(this.evenement).subscribe({
      next: (data) => {
        this.loading = false;
        alert('🎉 Événement créé avec succès !');
        this.router.navigate(['/organisateur/mes-evenements']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur:', err);
        
        // Message d'erreur adapté
        if (err.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.');
          this.router.navigate(['/login']);
        } else if (err.status === 400) {
          alert('Données invalides. Veuillez vérifier les informations saisies.');
        } else {
          alert('Une erreur est survenue lors de la création. Veuillez réessayer.');
        }
      }
    });
  }

  validateForm(): boolean {
    // Validation des champs obligatoires
    if (!this.evenement.titre?.trim()) {
      alert('Le titre est obligatoire');
      return false;
    }
    
    if (!this.evenement.lieu?.trim()) {
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
    
    // Validation des dates
    const dateDebut = new Date(this.evenement.dateDebut);
    const dateFin = new Date(this.evenement.dateFin);
    
    if (dateDebut >= dateFin) {
      alert('La date de fin doit être après la date de début');
      return false;
    }
    
    // Vérifier que la date n'est pas passée
    if (dateDebut < new Date()) {
      alert('La date de début ne peut pas être dans le passé');
      return false;
    }
    
    // Validation de la capacité
    if (!this.evenement.capaciteMax || this.evenement.capaciteMax < 1) {
      alert('La capacité doit être au moins de 1 personne');
      return false;
    }
    
    if (this.evenement.capaciteMax > 1000) {
      alert('La capacité maximale est de 1000 participants');
      return false;
    }
    
    return true;
  }
}