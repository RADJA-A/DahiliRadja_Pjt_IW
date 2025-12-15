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
  errorMessage = '';
  
  evenement: Evenement = {
    titre: '',
    type: 'CONFERENCE',
    lieu: '',
    dateDebut: '',
    dateFin: '',
    capaciteMax: 50,
    organisateurId: 0, // Temporairement 0
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
    console.log('=== CREER EVENEMENT INIT ===');
    
    const userStr = localStorage.getItem('user');
    console.log('User string from localStorage:', userStr);
    
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        console.log('Parsed user:', this.user);
        console.log('User ID:', this.user.id);
        console.log('User ID type:', typeof this.user.id);
        
        // Convertir en nombre si besoin
        if (this.user.id) {
          this.user.id = Number(this.user.id);
          console.log('User ID as number:', this.user.id);
          
          // Définir l'organisateurId
          this.evenement.organisateurId = this.user.id;
          console.log('Evenement organisateurId set to:', this.evenement.organisateurId);
        } else {
          console.error('User ID is missing or 0!');
          this.errorMessage = 'Erreur: ID utilisateur non trouvé. Veuillez vous reconnecter.';
        }
      } catch (error) {
        console.error('Error parsing user:', error);
        this.errorMessage = 'Erreur de chargement du profil utilisateur';
      }
    } else {
      console.error('No user found in localStorage');
      this.errorMessage = 'Vous devez être connecté pour créer un événement';
      // Rediriger vers login
      setTimeout(() => this.router.navigate(['/login']), 2000);
    }
  }

  onSubmit() {
    console.log('=== SUBMIT FORM ===');
    console.log('Form data before validation:', this.evenement);
    
    // Vérifier que l'organisateurId est défini
    if (!this.evenement.organisateurId || this.evenement.organisateurId === 0) {
      console.error('ERROR: organisateurId is 0 or undefined!');
      console.error('User object:', this.user);
      alert('ERREUR: Impossible de créer l\'événement. ID organisateur manquant. Veuillez vous reconnecter.');
      return;
    }
    
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    console.log('Sending event to API:', this.evenement);
    console.log('Organisateur ID being sent:', this.evenement.organisateurId);
    
    this.evenementService.createEvenement(this.evenement).subscribe({
      next: (data) => {
        console.log('Event created successfully:', data);
        console.log('Created event ID:', data.id);
        console.log('Created event organisateurId:', data.organisateurId);
        
        alert('Événement créé avec succès ! 🎉');
        this.router.navigate(['/organisateur/mes-evenements']);
      },
      error: (err) => {
        console.error('Error creating event:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error response:', err.error);
        
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la création de l\'événement';
        alert('Erreur: ' + this.errorMessage);
      }
    });
  }

  validateForm(): boolean {
    console.log('Validating form...');
    
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
    
    const dateDebut = new Date(this.evenement.dateDebut);
    const dateFin = new Date(this.evenement.dateFin);
    
    if (dateDebut >= dateFin) {
      alert('La date de fin doit être après la date de début');
      return false;
    }
    
    if (this.evenement.capaciteMax < 1) {
      alert('La capacité doit être au moins de 1 personne');
      return false;
    }
    
    console.log('Form validation passed');
    return true;
  }

  // Méthode pour déboguer
  debugUser() {
    console.log('=== DEBUG USER ===');
    console.log('LocalStorage user:', localStorage.getItem('user'));
    console.log('Component user:', this.user);
    console.log('Event organisateurId:', this.evenement.organisateurId);
    
    // Vérifier manuellement
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      console.log('Manual parse:', user);
      console.log('Manual ID:', user.id);
    }
  }

  // Méthode pour tester avec un ID fixe
  testWithFixedId() {
    console.log('Testing with fixed ID...');
    this.evenement.organisateurId = 1; // Votre ID utilisateur réel
    console.log('organisateurId set to:', this.evenement.organisateurId);
    
    // Remplir quelques champs pour tester
    this.evenement.titre = 'Test Event - ' + new Date().toLocaleTimeString();
    this.evenement.lieu = 'Test Location';
    this.evenement.dateDebut = new Date().toISOString().slice(0, 16);
    this.evenement.dateFin = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);
    this.evenement.capaciteMax = 10;
    
    console.log('Test data ready:', this.evenement);
    alert('Test data prepared. Click "Créer l\'événement" to test.');
  }
}