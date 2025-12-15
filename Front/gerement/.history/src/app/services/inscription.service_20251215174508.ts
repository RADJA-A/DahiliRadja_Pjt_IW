import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, forkJoin, map, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, User } from './auth.service';
import { EvenementService, Evenement } from './evenement.service'; 

export interface Inscription {
  id?: number;
  userId: number;
  evenementId: number;
  
  // Champs optionnels pour l'affichage
  userNom?: string;
  userPrenom?: string;
  
  // Informations ÉVÉNEMENT (seulement les essentielles)
  evenementTitre?: string;
  evenementDateDebut?: string;
  evenementLieu?: string;
  evenementType?: string; // Important pour l'image
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = 'http://localhost:8084/api/inscriptions';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private evenementService: EvenementService 
  ) {}

  // S'inscrire à un événement
  inscrire(inscriptionData: { userId: number, evenementId: number }): Observable<Inscription> {
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

  // Obtenir toutes les inscriptions d'un utilisateur (NON enrichies)
  getMesInscriptions(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Obtenir toutes les inscriptions d'un utilisateur (ENRICHIES avec infos événement seulement)
  getMesInscriptionsEnriched(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptionsEvenement(inscriptions))
    );
  }

  // Obtenir tous les participants d'un événement (NON enrichies)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`);
  }

  // Obtenir tous les participants d'un événement (ENRICHIES avec noms utilisateurs)
  getParticipantsEnriched(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptionsUtilisateurs(inscriptions))
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

  // MÉTHODE SIMPLIFIÉE : Enrichir uniquement avec les infos événement
  enrichirInscriptionsEvenement(inscriptions: Inscription[]): Observable<Inscription[]> {
    if (!inscriptions || inscriptions.length === 0) {
      return of([]);
    }

    // Récupérer les IDs uniques des événements
    const uniqueEventIds = [...new Set(inscriptions.map(p => p.evenementId))];
    
    // Récupérer les événements via EvenementService
    const eventsRequests = uniqueEventIds.map(eventId => 
      this.evenementService.getEvenementById(eventId).pipe(
        catchError(error => {
          console.error(`Erreur chargement événement ${eventId}:`, error);
          return of(null);
        })
      )
    );

    return forkJoin(eventsRequests).pipe(
      map(events => {
        // Créer une map pour un accès rapide
        const eventsMap = new Map<number, Evenement | null>();
        events.forEach(event => {
          if (event) {
            eventsMap.set(event.id!, event);
          }
        });
        
        // Enrichir les inscriptions UNIQUEMENT avec les infos événement
        return inscriptions.map(inscription => {
          const event = eventsMap.get(inscription.evenementId);
          
          // Créer une nouvelle inscription avec seulement les champs nécessaires
          const enrichedInscription: Inscription = {
            id: inscription.id,
            userId: inscription.userId,
            evenementId: inscription.evenementId,
            // Pas besoin de userNom, userPrenom, userEmail, userTelephone
          };
          
          // Ajouter seulement les infos événement essentielles
          if (event) {
            enrichedInscription.evenementTitre = event.titre;
            enrichedInscription.evenementDateDebut = event.dateDebut;
            enrichedInscription.evenementLieu = event.lieu;
            enrichedInscription.evenementType = event.type; // IMPORTANT pour l'image
          }
          
          return enrichedInscription;
        });
      }),
      catchError(error => {
        console.error('Erreur lors de l\'enrichissement événement:', error);
        return of(inscriptions);
      })
    );
  }

  // MÉTHODE pour enrichir avec les noms utilisateurs (pour la liste des participants)
  enrichirInscriptionsUtilisateurs(inscriptions: Inscription[]): Observable<Inscription[]> {
    if (!inscriptions || inscriptions.length === 0) {
      return of([]);
    }

    // Récupérer les IDs uniques des utilisateurs
    const uniqueUserIds = [...new Set(inscriptions.map(p => p.userId))];
    
    return this.authService.getUsersByIds(uniqueUserIds).pipe(
      map(users => {
        const usersMap = new Map<number, User>();
        users.forEach(user => {
          usersMap.set(user.id, user);
        });
        
        return inscriptions.map(inscription => {
          const user = usersMap.get(inscription.userId);
          if (user) {
            return {
              ...inscription,
              userNom: user.nom,
              userPrenom: user.prenom
            };
          }
          return inscription;
        });
      }),
      catchError(error => {
        console.error('Erreur lors de l\'enrichissement utilisateurs:', error);
        return of(inscriptions);
      })
    );
  }
}