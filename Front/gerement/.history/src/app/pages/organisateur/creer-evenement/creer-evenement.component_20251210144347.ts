import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvenementService, Evenement } from '../../../services/evenement.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-creer-evenement',
  standalone: true, // ← AJOUT
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './creer-evenement.component.html',
  styleUrls: ['./creer-evenement.component.css']
})
export class CreerEvenementComponent implements OnInit {
  user: any;
  loading = false;
  formSubmitted = false;
  errorMessage = '';
  dateError = '';
  capacityError = '';
  
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
    console.log('🔍 Checking localStorage...');
    const userStr = localStorage.getItem('user');
    console.log('📦 User string:', userStr);
    
    if (userStr) {
      this.user = JSON.parse(userStr);
      console.log('👤 Parsed user:', this.user);
      console.log('🆔 User ID:', this.user.id);
      
      // FORCER L'ID
      this.evenement.organisateurId = Number(this.user.id) || 0;
      console.log('✅ Organisateur ID set to:', this.evenement.organisateurId);
      
      if (this.evenement.organisateurId === 0) {
        console.error('❌ WARNING: organisateurId is still 0!');
        alert('Erreur: Impossible de récupérer votre ID utilisateur. Veuillez vous reconnecter.');
        this.router.navigate(['/login']);
      }
    } else {
      console.error('❌ No user in localStorage!');
      alert('Vous devez être connecté pour créer un événement');
      this.router.navigate(['/login']);
    }
  }

  getTypeLabel(type: string): string {
    return type.replace(/_/g, ' ');
  }

  onSubmit() {
    this.formSubmitted = true;
    this.errorMessage = '';
    this.dateError = '';
    this.capacityError = '';

    if (!this.validateForm()) {
      return;
    }

    console.log('📤 Sending event:', this.evenement);
    console.log('🆔 Final organisateur ID:', this.evenement.organisateurId);

    this.loading = true;
    this.evenementService.createEvenement(this.evenement).subscribe({
      next: (data) => {
        console.log('✅ Event created:', data);
        alert('Événement créé avec succès ! 🎉');
        this.router.navigate(['/organisateur/mes-evenements']);
      },
      error: (err) => {
        console.error('❌ Error creating event:', err);
        this.errorMessage = 'Erreur lors de la création de l\'événement';
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    let isValid = true;

    if (!this.evenement.titre?.trim()) {
      this.errorMessage = 'Le titre est obligatoire';
      isValid = false;
    }

    if (!this.evenement.lieu?.trim()) {
      this.errorMessage = 'Le lieu est obligatoire';
      isValid = false;
    }

    if (!this.evenement.dateDebut) {
      this.dateError = 'La date de début est obligatoire';
      isValid = false;
    }

    if (!this.evenement.dateFin) {
      this.dateError = 'La date de fin est obligatoire';
      isValid = false;
    }

    if (this.evenement.dateDebut && this.evenement.dateFin) {
      const debut = new Date(this.evenement.dateDebut);
      const fin = new Date(this.evenement.dateFin);
      
      if (debut >= fin) {
        this.dateError = 'La date de fin doit être après la date de début';
        isValid = false;
      }
      
      if (debut < new Date()) {
        this.dateError = 'La date de début ne peut pas être dans le passé';
        isValid = false;
      }
    }

    if (this.evenement.capaciteMax < 1) {
      this.capacityError = 'La capacité doit être au moins de 1 personne';
      isValid = false;
    }

    if (this.evenement.capaciteMax > 1000) {
      this.capacityError = 'La capacité ne peut pas dépasser 1000 personnes';
      isValid = false;
    }

    return isValid;
  }
}