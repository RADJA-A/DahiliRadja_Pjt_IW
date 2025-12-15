import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, forkJoin, map } from 'rxjs';
import { AuthService, User } from './auth.service'; // Importez AuthService

export interface Inscription {
  id?: number;
  userId: number;
  evenementId: number;
  
  // Champs optionnels pour l'affichage (seront remplis via enrichissement)
  userNom?: string;
  userPrenom?: string;
  userEmail?: string;
  userTelephone?: string;
  
  // Info événement (optionnel)
  evenementTitre?: string;
  evenementDateDebut?: string;
  evenementLieu?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = 'http://localhost:8084/api/inscriptions';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Injectez AuthService
  ) {}

  // S'inscrire à un événement
  inscrire(userId: number, evenementId: number): Observable<Inscription> {
    const inscriptionData = {
      userId: userId,
      evenementId: evenementId
    };
    
    return this.http.post<Inscription>(this.apiUrl, inscriptionData).pipe(
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

  // Obtenir toutes les inscriptions d'un utilisateur (ENRICHIES)
  getMesInscriptions(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(inscriptions => {
        // Ici vous pourriez enrichir les inscriptions
        // Pour l'instant, retournez les inscriptions telles quelles
        return inscriptions;
      })
    );
  }

  // Obtenir tous les participants d'un événement (ENRICHIES)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`).pipe(
      map(inscriptions => {
        // Pour l'instant, retournez les inscriptions sans enrichissement
        // Vous pouvez appeler enrichirInscriptions() si besoin
        return inscriptions;
      })
    );
  }

  // NOUVELLE METHODE : Récupérer les participants enrichis
  getParticipantsEnriched(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`).pipe(
      map(inscriptions => {
        return this.enrichirInscriptions(inscriptions);
      })
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

  // MÉTHODE POUR ENRICHIR LES INSCRIPTIONS AVEC LES INFOS UTILISATEUR
  enrichirInscriptions(inscriptions: Inscription[]): Observable<Inscription[]> {
    if (!inscriptions || inscriptions.length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    // Récupérer les IDs uniques des utilisateurs
    const uniqueUserIds = [...new Set(inscriptions.map(p => p.userId))];
    
    // Récupérer les utilisateurs via AuthService
    return this.authService.getUsersByIds(uniqueUserIds).pipe(
      map(users => {
        // Créer une map pour un accès rapide
        const usersMap = new Map<number, User>();
        users.forEach(user => {
          usersMap.set(user.id, user);
        });
        
        // Enrichir les inscriptions
        return inscriptions.map(inscription => {
          const user = usersMap.get(inscription.userId);
          if (user) {
            return {
              ...inscription,
              userNom: user.nom,
              userPrenom: user.prenom,
              userEmail: user.email,
              // Si vous avez un champ telephone dans User, ajoutez-le
              userTelephone: (user as any).telephone || 'Non disponible'
            };
          }
          return inscription;
        });
      })
    );
  }

  // Méthode utilitaire pour créer une inscription de test
  creerInscriptionTest(userId: number, evenementId: number): Inscription {
    return {
      id: Math.floor(Math.random() * 1000),
      userId: userId,
      evenementId: evenementId,
      userNom: `Test User ${userId}`,
      userPrenom: 'Test',
      userEmail: `test${userId}@example.com`,
      userTelephone: '01 23 45 67 89'
    };
  }
}