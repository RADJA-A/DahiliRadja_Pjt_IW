import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, forkJoin, map, switchMap } from 'rxjs'; // Ajoutez switchMap
import { AuthService, User } from './auth.service';
import { EvenementService, Evenement } from './evenement.service'; 

export interface Inscription {
  id?: number;
  userId: number;
  evenementId: number;
  
  // Champs optionnels pour l'affichage
  userNom?: string;
  userPrenom?: string;
  userEmail?: string;
  userTelephone?: string;
  
  evenementTitre?: string;
  evenementDateDebut?: string;
  evenementLieu?: string;
  evenementType?: string;
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

  // Obtenir toutes les inscriptions d'un utilisateur (ENRICHIES)
  getMesInscriptionsEnriched(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptions(inscriptions))
    );
  }

  // Obtenir tous les participants d'un événement (NON enrichies)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`);
  }

  // Obtenir tous les participants d'un événement (ENRICHIES)
  getParticipantsEnriched(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptions(inscriptions))
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
 // MÉTHODE POUR ENRICHIR LES INSCRIPTIONS AVEC LES INFOS UTILISATEUR ET ÉVÉNEMENT
  enrichirInscriptionsComplet(inscriptions: Inscription[]): Observable<Inscription[]> {
    if (!inscriptions || inscriptions.length === 0) {
      return of([]);
    }

    // Récupérer les IDs uniques des utilisateurs et événements
    const uniqueUserIds = [...new Set(inscriptions.map(p => p.userId))];
    const uniqueEventIds = [...new Set(inscriptions.map(p => p.evenementId))];
    
    // Récupérer les utilisateurs via AuthService
    const usersRequest = this.authService.getUsersByIds(uniqueUserIds);
    
    // Récupérer les événements via EvenementService
    const eventsRequests = uniqueEventIds.map(eventId => 
      this.evenementService.getEvenementById(eventId).pipe(
        catchError(error => {
          console.error(`Erreur chargement événement ${eventId}:`, error);
          return of(null);
        })
      )
    );

    return forkJoin({
      users: usersRequest,
      events: forkJoin(eventsRequests)
    }).pipe(
      map(({ users, events }) => {
        // Créer des maps pour un accès rapide
        const usersMap = new Map<number, User>();
        users.forEach(user => {
          usersMap.set(user.id, user);
        });

        const eventsMap = new Map<number, Evenement | null>();
        events.forEach(event => {
          if (event) {
            eventsMap.set(event.id!, event);
          }
        });
        
        // Enrichir les inscriptions
        return inscriptions.map(inscription => {
          const user = usersMap.get(inscription.userId);
          const event = eventsMap.get(inscription.evenementId);
          
          const enrichedInscription: Inscription = { ...inscription };
          
          // Enrichir avec les infos utilisateur
          if (user) {
            enrichedInscription.userNom = user.nom;
            enrichedInscription.userPrenom = user.prenom;
            enrichedInscription.userEmail = user.email;
            enrichedInscription.userTelephone = (user as any).telephone || 'Non disponible';
          }
          
          // Enrichir avec les infos événement
          if (event) {
            enrichedInscription.evenementTitre = event.titre;
            enrichedInscription.evenementDateDebut = event.dateDebut;
            enrichedInscription.evenementLieu = event.lieu;
            enrichedInscription.evenementType = event.type;
          }
          
          return enrichedInscription;
        });
      }),
      catchError(error => {
        console.error('Erreur lors de l\'enrichissement des inscriptions:', error);
        return of(inscriptions); // Retourne les inscriptions non enrichies en cas d'erreur
      })
    );
  }

  // Version enrichie améliorée
  getMesInscriptionsEnriched(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptionsComplet(inscriptions))
    );
  }
}