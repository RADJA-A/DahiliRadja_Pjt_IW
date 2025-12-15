import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EvenementService, Evenement } from '../../../services/evenement.service';

@Component({
  selector: 'app-modifier-evenement',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './modifier-evenement.component.html',
  styleUrls: ['./modifier-evenement.component.css']
})
export class ModifierEvenementComponent implements OnInit {
  user: any;
  evenement?: Evenement;
  loading = false;
  formSubmitted = false;
  errorMessage = '';
  dateError = '';
  capacityError = '';
  evenementId!: number;

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
    private route: ActivatedRoute,
    private router: Router,
    private evenementService: EvenementService
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }

    this.evenementId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvenement();
  }

  loadEvenement() {
    this.loading = true;
    this.evenementService.getEvenementById(this.evenementId).subscribe({
      next: (data) => {
        this.evenement = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Événement non trouvé');
        this.router.navigate(['/organisateur/mes-evenements']);
      }
    });
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

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'A_VENIR': 'À venir',
      'EN_COURS': 'En cours',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé',
      'COMPLET': 'Complet'
    };
    return labels[statut] || statut;
  }

  getStatusClass(statut: string): string {
    return statut || 'A_VENIR';
  }

  formatDateTimeLocal(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit() {
    this.formSubmitted = true;
    this.errorMessage = '';
    this.dateError = '';
    this.capacityError = '';

    if (!this.validateForm()) {
      return;
    }

    if (!this.user?.id) {
      alert('Vous devez être connecté pour modifier un événement');
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true;
    
    // Préparer les données pour l'update
    const updateData = {
      titre: this.evenement?.titre,
      type: this.evenement?.type,
      lieu: this.evenement?.lieu,
      dateDebut: this.evenement?.dateDebut,
      dateFin: this.evenement?.dateFin,
      capaciteMax: this.evenement?.capaciteMax,
      imageUrl: this.evenement?.imageUrl,
      programme: this.evenement?.programme
    };

    this.evenementService.updateEvenement(this.evenementId, updateData, this.user.id).subscribe({
      next: () => {
        this.loading = false;
        alert('Événement modifié avec succès ! 🎉');
        this.router.navigate(['/organisateur/mes-evenements']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la modification';
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.evenement) return false;

    let isValid = true;

    if (!this.evenement.titre?.trim()) {
      this.errorMessage = 'Le titre est obligatoire';
      isValid = false;
    }

    if (!this.evenement.lieu?.trim()) {
      this.errorMessage = 'Le lieu est obligatoire';
      isValid = false;
    }

    if (this.evenement.dateDebut && this.evenement.dateFin) {
      const debut = new Date(this.evenement.dateDebut);
      const fin = new Date(this.evenement.dateFin);
      
      if (debut >= fin) {
        this.dateError = 'La date de fin doit être après la date de début';
        isValid = false;
      }
    }

    if (this.evenement.capaciteMax < 1) {
      this.capacityError = 'La capacité doit être au moins de 1 personne';
      isValid = false;
    }

    return isValid;
  }
}