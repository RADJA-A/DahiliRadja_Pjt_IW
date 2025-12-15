import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Inscription {
  id?: number;
  userId: number;
  evenementId: number;
  dateInscription?: string;
  statut?: string;

  // Champs optionnels pour l'affichage (remplis par le backend ou frontend)
  userNom?: string;
  userPrenom?: string;
  userEmail?: string;
  userTelephone?: string;
  
  // Info événement (optionnel)
  evenementTitre?: string;
  evenementDateDebut?: string;
  evenementLieu?: string;
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
  evenement?: {
    id: number;
    titre: string;
    dateDebut: string;
    dateFin: string;
    lieu: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = 'http://localhost:8083/api/inscriptions'; // Port 8083 selon architecture

  constructor(private http: HttpClient) {}

  // S'inscrire à un événement
  inscrire(inscription: Inscription): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, inscription).pipe(
      tap(inscriptionCreee => {
        console.log('✅ Inscription créée:', inscriptionCreee);
      })
    );
  }

  // Se désinscrire d'un événement
  desinscrire(inscriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${inscriptionId}`).pipe(
      tap(() => {
        console.log('✅ Désinscription effectuée');
      })
    );
  }

  // Obtenir toutes les inscriptions d'un utilisateur
  getMesInscriptions(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Obtenir tous les participants d'un événement (pour organisateur)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`);
  }

  // BONUS: Si votre backend supporte cette route
  // Obtenir les participants avec infos utilisateur complètes
  getParticipantsWithUserInfo(evenementId: number): Observable<InscriptionComplete[]> {
    return this.http.get<InscriptionComplete[]>(
      `${this.apiUrl}/evenement/${evenementId}/details`
    );
  }

  // Vérifier si un utilisateur est déjà inscrit à un événement
  isUserInscrit(userId: number, evenementId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/verifier/${userId}/${evenementId}`
    );
  }

  // Obtenir une inscription spécifique
  getInscriptionById(inscriptionId: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.apiUrl}/${inscriptionId}`);
  }

  // Obtenir le nombre total d'inscrits pour un événement
  getNombreInscrits(evenementId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/evenement/${evenementId}/count`);
  }

  // Annuler une inscription (différent de désinscrire si vous gérez des statuts)
  annulerInscription(inscriptionId: number): Observable<Inscription> {
    return this.http.put<Inscription>(
      `${this.apiUrl}/${inscriptionId}/annuler`,
      {}
    );
  }
}