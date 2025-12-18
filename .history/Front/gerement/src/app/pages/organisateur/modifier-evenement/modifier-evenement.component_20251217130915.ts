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
  evenement: Evenement = {
    id: 0,
    titre: '',
    type: 'CONFERENCE',
    lieu: '',
    dateDebut: '',
    dateFin: '',
    capaciteMax: 0,
    imageUrl: '',
    programme: '',
    statut: 'AVENIR', // Par défaut
    nombreInscrits: 0,
    organisateurId: 0
  };
  
  loading = false;
  formSubmitted = false;
  errorMessage = '';
  dateError = '';
  capacityError = '';
  evenementId!: number;
  
  // Ajouter un champ pour le nouveau statut si on veut le changer
  nouveauStatut: string = '';

  types = [
    'CONFERENCE',
    'FORMATION',
    'CONCERT',
    'JOURNEE_SCIENTIFIQUE',
    'JOURNEE_CULTURELLE',
    'SEMINAIRE',
    'ATELIER',
    'MARRIAGE',
    'FESTIVAL',
    'AUTRE'
  ];

  // Liste des statuts possibles
  statuts = ['AVENIR', 'ENCOURS', 'TERMINE', 'ANNULE'];

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
        this.nouveauStatut = data.statut || 'AVENIR'; // Initialiser avec le statut actuel
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
      'CONFERENCE': 'Conférence',
      'FORMATION': 'Formation',
      'CONCERT': 'Concert',
      'JOURNEE_SCIENTIFIQUE': 'Journée Scientifique',
      'JOURNEE_CULTURELLE': 'Journée Culturelle',
      'SEMINAIRE': 'Séminaire',
      'ATELIER': 'Atelier',
      'MARRIAGE': 'Marriage',
      'FESTIVAL': 'Festival',
      'AUTRE': 'Autre'
    };
    return labels[type] || type;
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'AVENIR': 'À venir',
      'ENCOURS': 'En cours',
      'TERMINE': 'Terminé',
      'ANNULE': 'Annulé'
    };
    return labels[statut] || statut;
  }

  formatDateTimeLocal(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Format: YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return '';
    }
  }

  // Vérifier si l'événement doit être marqué comme terminé automatiquement
  checkIfEventShouldBeTerminated(): boolean {
    if (!this.evenement.dateFin) return false;
    
    const now = new Date();
    const dateFin = new Date(this.evenement.dateFin);
    
    return now > dateFin && this.evenement.statut !== 'TERMINE' && this.evenement.statut !== 'ANNULE';
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

    // Vérifier si l'événement doit être automatiquement marqué comme terminé
    if (this.checkIfEventShouldBeTerminated()) {
      if (confirm('La date de fin est dépassée. Voulez-vous marquer cet événement comme terminé ?')) {
        this.nouveauStatut = 'TERMINE';
      }
    }

    this.loading = true;
    
    // Préparer les données pour l'update
    const updateData = {
      titre: this.evenement.titre,
      type: this.evenement.type,
      lieu: this.evenement.lieu,
      dateDebut: this.evenement.dateDebut,
      dateFin: this.evenement.dateFin,
      capaciteMax: this.evenement.capaciteMax,
     // statut: this.nouveauStatut, // Inclure le statut (peut être changé)
        statut: this.nouveauStatut || this.evenement.statut, 
      imageUrl: this.evenement.imageUrl || '',
      programme: this.evenement.programme || ''
    };

    this.evenementService.updateEvenement(this.evenementId, updateData, this.user.id).subscribe({
      next: () => {
        this.loading = false;
        alert('Événement modifié avec succès !');
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

  // Méthode pour annuler l'événement
  annulerEvenement() {
    if (confirm('Êtes-vous sûr de vouloir annuler cet événement ? Cette action est irréversible.')) {
      this.nouveauStatut = 'ANNULE';
      this.onSubmit(); // Soumettre le formulaire avec le nouveau statut
    }
  }

  // Méthode pour marquer comme terminé manuellement
  terminerEvenement() {
    if (confirm('Marquer cet événement comme terminé ?')) {
      this.nouveauStatut = 'TERMINE';
      this.onSubmit();
    }
  }
}