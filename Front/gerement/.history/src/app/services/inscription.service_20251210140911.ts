import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Inscription {
  id?: number;
  userId: number;
  evenementId: number;
  dateInscription?: string;
  statut?: string;
  // Pour afficher les infos utilisateur, vous pourriez avoir besoin de:
  nom?: string;
  prenom?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = 'http://localhost:8083/api/inscriptions';

  constructor(private http: HttpClient) {}

  // Méthode pour obtenir les inscriptions d'un événement (LES PARTICIPANTS)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    console.log('Getting participants for event:', evenementId);
    
    // Essayez différents endpoints possibles:
    // Option 1: /evenement/{id}
    // Option 2: /by-evenement/{id}
    // Option 3: /event/{id}
    
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`).pipe(
      tap(participants => {
        console.log('Participants received:', participants);
        console.log('Number of participants:', participants?.length || 0);
      })
    );
  }

  // Alternative si l'endpoint a un nom différent
  getInscriptionsByEvenement(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/by-evenement/${evenementId}`);
  }

  // Méthode existante pour s'inscrire
  inscrire(inscription: Inscription): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, inscription);
  }

  // Méthode existante pour obtenir mes inscriptions
  getMesInscriptions(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Annuler une inscription
  annulerInscription(inscriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${inscriptionId}`);
  }

  // Vérifier si déjà inscrit
  checkInscription(userId: number, evenementId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${userId}/${evenementId}`);
  }
}