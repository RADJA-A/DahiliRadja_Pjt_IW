import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationService } from './notification.service'; // Ajoutez cette importation

export interface Inscription {
  id?: number;
  userId: number;
  evenementId: number;
  dateInscription?: string;
  statut?: string; // Ajoutez ce champ si vous avez des statuts

   // Pour affichage, vous pouvez ajouter ces champs optionnels
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
}

export interface InscriptionComplete {
  id: number;
  userId: number;
  evenementId: number;
  dateInscription: string;
  statut?: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = 'http://localhost:8084/api/inscriptions';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService // Ajoutez cette injection
  ) {}

  // S'inscrire avec notification
  inscrire(inscription: Inscription): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, inscription).pipe(
      tap(inscriptionCreee => {
        console.log('Inscription créée:', inscriptionCreee);
        
        // Ici, vous devriez déclencher une notification pour l'organisateur
        // Mais pour cela, vous avez besoin de plus d'informations
        // Le backend devrait gérer ça
      })
    );
  }

  // Se désinscrire
  desinscrire(inscriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${inscriptionId}`);
  }

  // Mes inscriptions
  getMesInscriptions(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Participants d'un événement (pour organisateur)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`);
  }

  // Obtenir les participants d'un événement (pour organisateur)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}/participants`);
  }

  // Optionnel: Obtenir les participants avec infos utilisateur (si votre backend le permet)
  getParticipantsWithUserInfo(evenementId: number): Observable<InscriptionComplete[]> {
    return this.http.get<InscriptionComplete[]>(`${this.apiUrl}/evenement/${evenementId}/participants-details`);
  }

  // Vérifier si l'utilisateur est déjà inscrit
  checkInscription(userId: number, evenementId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verifier-inscription/${userId}/${evenementId}`);
  }

  // Obtenir le nombre d'inscrits pour un événement
  getNombreInscrits(evenementId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/evenement/${evenementId}/nombre-inscrits`);
  }
}