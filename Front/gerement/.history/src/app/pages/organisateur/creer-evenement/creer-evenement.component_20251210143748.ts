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
    console.log('=== INIT CREER EVENEMENT ===');
    
    // Récupérer l'utilisateur connecté
    const userStr = localStorage.getItem('user');
    console.log('User string from localStorage:', userStr);
    
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
        console.log('✅ Parsed user:', this.user);
        console.log('✅ User ID:', this.user.id);
        console.log('✅ User ID type:', typeof this.user.id);
        
        // Définir l'ID de l'organisateur
        if (this.user && this.user.id) {
          this.evenement.organisateurId = Number(this.user.id);
          console.log('✅ Event organisateurId set to:', this.evenement.organisateurId);
        } else {
          console.error('❌ User ID is missing or 0!');
          console.log('User object:', this.user);
        }
      } catch (error) {
        console.error('❌ Error parsing user:', error);
      }
    } else {
      console.error('❌ No user found in localStorage!');
    }
    
    console.log('=== END INIT ===');
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

  onSubmit() {
    console.log('=== ON SUBMIT ===');
    console.log('Event data:', this.evenement);
    console.log('Organisateur ID:', this.evenement.organisateurId);
    
    if (!this.validateForm()) {
      return;
    }

    // VÉRIFICATION FINALE AVANT ENVOI
    if (!this.evenement.organisateurId || this.evenement.organisateurId === 0) {
      console.error('❌ ORGANISATEUR ID IS 0!');
      console.error('User object:', this.user);
      
      // Recharger depuis localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Reloaded from localStorage:', user);
        this.evenement.organisateurId = user.id || 0;
        console.log('New organisateurId:', this.evenement.organisateurId);
      }
      
      if (this.evenement.organisateurId === 0) {
        alert('ERREUR CRITIQUE: ID organisateur = 0. Veuillez vous reconnecter.');
        this.router.navigate(['/login']);
        return;
      }
    }

    this.loading = true;
    
    console.log('📤 Sending request with organisateurId:', this.evenement.organisateurId);

    // Créer l'événement
    this.evenementService.createEvenement(this.evenement).subscribe({
      next: (data) => {
        console.log('✅ Event created successfully:', data);
        this.loading = false;
        alert('Événement créé avec succès ! 🎉');
        this.router.navigate(['/organisateur/mes-evenements']);
      },
      error: (err) => {
        console.error('❌ Error creating event:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error response:', err.error);
        
        this.loading = false;
        
        // Gestion des erreurs spécifiques
        if (err.status === 401) {
          alert('Session expirée. Veuillez vous reconnecter.');
          this.router.navigate(['/login']);
        } else if (err.status === 400) {
          alert('Données invalides: ' + (err.error?.message || 'Vérifiez vos informations.'));
        } else if (err.status === 0) {
          alert('Serveur inaccessible. Vérifiez que le service événements est démarré (port 8082).');
        } else {
          alert('Erreur: ' + (err.error?.message || 'Échec de la création.'));
        }
      }
    });
  }
  
  // Méthode pour tester manuellement
  testCreateEvent() {
    console.log('🧪 TEST: Creating event with manual data...');
    
    // Données de test
    this.evenement = {
      titre: 'Test Event ' + new Date().toLocaleTimeString(),
      type: 'CONFERENCE',
      lieu: 'Test Location',
      dateDebut: new Date().toISOString().slice(0, 16), // Format datetime-local
      dateFin: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
      capaciteMax: 10,
      organisateurId: this.user?.id || 1, // Utilise l'ID utilisateur ou 1 par défaut
      imageUrl: '',
      programme: 'Test programme'
    };
    
    console.log('Test data:', this.evenement);
    alert('Données de test prêtes. Cliquez sur "Créer l\'événement".');
  }
}