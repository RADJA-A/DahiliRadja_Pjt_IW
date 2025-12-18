import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, forkJoin, map, switchMap, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, User } from './auth.service';
import { EvenementService, Evenement } from './evenement.service';
import { NotificationService } from './notification.service'; // NOUVEAU

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
    private evenementService: EvenementService,
    private notificationService: NotificationService // NOUVEAU
  ) {}

  // =====================================================================
  // S'inscrire à un événement - AVEC NOTIFICATION
  // =====================================================================
  inscrire(inscriptionData: { userId: number, evenementId: number }): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, inscriptionData).pipe(
      switchMap(inscriptionCreee => {
        console.log('✅ Inscription créée:', inscriptionCreee);
        
        // Récupérer l'événement pour envoyer la notification
        return this.evenementService.getEvenementById(inscriptionData.evenementId).pipe(
          switchMap(evenement => {
            // Envoyer la notification de confirmation
            if (inscriptionCreee.id) {
              return this.notificationService.envoyerConfirmationInscription(
                inscriptionData.userId,
                inscriptionData.evenementId,
                evenement.titre!,
                inscriptionCreee.id
              ).pipe(
                map(() => {
                  console.log('📧 Notification de confirmation envoyée');
                  return inscriptionCreee;
                }),
                catchError(error => {
                  console.warn('⚠️ Erreur envoi notification (inscription quand même créée):', error);
                  return of(inscriptionCreee);
                })
              );
            }
            return of(inscriptionCreee);
          }),
          catchError(error => {
            console.warn('⚠️ Erreur récupération événement pour notification:', error);
            return of(inscriptionCreee);
          })
        );
      })
    );
  }

  // =====================================================================
  // Se désinscrire d'un événement - AVEC NOTIFICATION
  // =====================================================================
  desinscrire(inscriptionId: number): Observable<void> {
    // D'abord récupérer l'inscription pour avoir les infos
    return this.getInscriptionById(inscriptionId).pipe(
      switchMap(inscription => {
        // Récupérer l'événement pour avoir son titre
        return this.evenementService.getEvenementById(inscription.evenementId).pipe(
          switchMap(evenement => {
            // Supprimer l'inscription
            return this.http.delete<void>(`${this.apiUrl}/${inscriptionId}`).pipe(
              switchMap(() => {
                console.log('✅ Désinscription effectuée');
                
                // Envoyer la notification d'annulation
                return this.notificationService.envoyerAnnulationInscription(
                  inscription.userId,
                  inscription.evenementId,
                  evenement.titre!
                ).pipe(
                  tap(() => console.log('📧 Notification d\'annulation envoyée')),
                  catchError(error => {
                    console.warn('⚠️ Erreur envoi notification:', error);
                    return of(undefined);
                  }),
                  map(() => undefined)
                );
              })
            );
          }),
          catchError(error => {
            console.warn('⚠️ Erreur récupération événement:', error);
            // Continuer quand même avec la désinscription
            return this.http.delete<void>(`${this.apiUrl}/${inscriptionId}`).pipe(
              tap(() => console.log('✅ Désinscription effectuée (sans notification)'))
            );
          })
        );
      })
    );
  }

  // =====================================================================
  // MÉTHODES INCHANGÉES
  // =====================================================================

  // Obtenir toutes les inscriptions d'un utilisateur (NON enrichies)
  getMesInscriptions(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Obtenir toutes les inscriptions d'un utilisateur (ENRICHIES - uniquement infos utilisateur)
  getMesInscriptionsEnriched(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptions(inscriptions))
    );
  }

  // Obtenir toutes les inscriptions d'un utilisateur (ENRICHIES - uniquement infos événement)
  getMesInscriptionsEvenement(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptionsEvenement(inscriptions))
    );
  }

  // Obtenir toutes les inscriptions d'un utilisateur (ENRICHIES complet)
  getMesInscriptionsComplet(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptionsComplet(inscriptions))
    );
  }

  // Obtenir tous les participants d'un événement (NON enrichies)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`);
  }

  // Obtenir tous les participants d'un événement (ENRICHIES)
  getParticipantsEnriched(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptionsAvecAPI(inscriptions))
    );
  }

  // Obtenir tous les participants d'un événement (ENRICHIES avec événement)
  getParticipantsEvenementEnriched(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`).pipe(
      switchMap(inscriptions => this.enrichirInscriptionsEvenement(inscriptions))
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

  // =====================================================================
  // NOUVELLE MÉTHODE PRINCIPALE : Enrichir avec localStorage + API
  // =====================================================================
  enrichirInscriptionsAvecAPI(inscriptions: Inscription[]): Observable<Inscription[]> {
    if (!inscriptions || inscriptions.length === 0) {
      return of([]);
    }

    console.log('📝 Enrichissement des inscriptions avec API...');

    const currentUser = this.authService.getCurrentUser();
    const uniqueUserIds = [...new Set(inscriptions.map(p => p.userId))];

    // Créer des requêtes pour chaque utilisateur
    const userRequests = uniqueUserIds.map(userId => {
      // Si c'est l'utilisateur connecté, utiliser ses données
      if (currentUser && userId === currentUser.id) {
        console.log('✅ Utilisation localStorage pour user:', userId);
        return of(currentUser);
      }
      
      // Sinon, faire un appel API individuel
      return this.authService.getUserById(userId).pipe(
        catchError(error => {
          console.warn(`⚠️ Erreur récupération user ${userId}:`, error);
          // Retourner des données par défaut
          return of({
            id: userId,
            nom: `Participant`,
            prenom: `${userId}`,
            email: `participant${userId}@example.com`,
            telephone: 'Non disponible',
            role: 'PARTICIPANT',
            active: true
          } as User);
        })
      );
    });

    return forkJoin(userRequests).pipe(
      map(users => {
        const usersMap = new Map<number, User>();
        users.forEach(user => usersMap.set(user.id, user));

        const enriched = inscriptions.map(inscription => {
          const user = usersMap.get(inscription.userId);
          if (user) {
            return {
              ...inscription,
              userNom: user.nom,
              userPrenom: user.prenom,
              userEmail: user.email,
              userTelephone: (user as any).telephone || 'Non renseigné'
            };
          }
          return inscription;
        });

        console.log('✅ Inscriptions enrichies:', enriched);
        return enriched;
      }),
      catchError(error => {
        console.error('❌ Erreur enrichissement:', error);
        return of(inscriptions);
      })
    );
  }

  // =====================================================================
  // MÉTHODE SIMPLE : Sans appel API (uniquement localStorage)
  // =====================================================================
  enrichirInscriptions(inscriptions: Inscription[]): Observable<Inscription[]> {
    if (!inscriptions || inscriptions.length === 0) {
      return of([]);
    }

    console.log('📝 Enrichissement simple des inscriptions...');

    const currentUser = this.authService.getCurrentUser();

    const enriched = inscriptions.map(inscription => {
      // Si c'est l'utilisateur connecté
      if (currentUser && inscription.userId === currentUser.id) {
        return {
          ...inscription,
          userNom: currentUser.nom,
          userPrenom: currentUser.prenom,
          userEmail: currentUser.email,
          userTelephone: (currentUser as any).telephone || 'Non renseigné'
        };
      }
      
      // Pour les autres participants, données par défaut
      return {
        ...inscription,
        userNom: `Participant`,
        userPrenom: `#${inscription.userId}`,
        userEmail: `participant${inscription.userId}@example.com`,
        userTelephone: 'Non disponible'
      };
    });

    console.log('✅ Inscriptions enrichies (simple):', enriched);
    return of(enriched);
  }

  // =====================================================================
  // Enrichir avec infos événement
  // =====================================================================
 enrichirInscriptionsEvenement(inscriptions: Inscription[]): Observable<Inscription[]> {
  if (!inscriptions || inscriptions.length === 0) {
    return of([]);
  }

  const uniqueEventIds = [...new Set(inscriptions.map(p => p.evenementId))];
  
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
      const eventsMap = new Map<number, Evenement | null>();
      events.forEach(event => {
        if (event) {
          eventsMap.set(event.id!, event);
        }
      });
      
      // CORRECTION : Garder TOUTES les propriétés originales
      return inscriptions.map(inscription => {
        const event = eventsMap.get(inscription.evenementId);
        
        // Créer une COPIE de l'inscription originale
        const enrichedInscription: Inscription = { ...inscription }; // ← Garde l'ID !
        
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
      console.error('Erreur lors de l\'enrichissement événement:', error);
      return of(inscriptions);
    })
  );
}

  // =====================================================================
  // Enrichir avec TOUT (utilisateur + événement)
  // =====================================================================
  enrichirInscriptionsComplet(inscriptions: Inscription[]): Observable<Inscription[]> {
    if (!inscriptions || inscriptions.length === 0) {
      return of([]);
    }

    const currentUser = this.authService.getCurrentUser();
    const uniqueUserIds = [...new Set(inscriptions.map(p => p.userId))];
    const uniqueEventIds = [...new Set(inscriptions.map(p => p.evenementId))];
    
    // Requêtes utilisateurs
    const userRequests = uniqueUserIds.map(userId => {
      if (currentUser && userId === currentUser.id) {
        return of(currentUser);
      }
      return this.authService.getUserById(userId).pipe(
        catchError(() => of({
          id: userId,
          nom: `Participant`,
          prenom: `${userId}`,
          email: `participant${userId}@example.com`,
          telephone: 'Non disponible',
          role: 'PARTICIPANT',
          active: true
        } as User))
      );
    });
    
    // Requêtes événements
    const eventsRequests = uniqueEventIds.map(eventId => 
      this.evenementService.getEvenementById(eventId).pipe(
        catchError(() => of(null))
      )
    );

    return forkJoin({
      users: forkJoin(userRequests),
      events: forkJoin(eventsRequests)
    }).pipe(
      map(({ users, events }) => {
        const usersMap = new Map<number, User>();
        users.forEach(user => usersMap.set(user.id, user));

        const eventsMap = new Map<number, Evenement | null>();
        events.forEach(event => {
          if (event) {
            eventsMap.set(event.id!, event);
          }
        });
        
        return inscriptions.map(inscription => {
          const user = usersMap.get(inscription.userId);
          const event = eventsMap.get(inscription.evenementId);
          
          const enrichedInscription: Inscription = { ...inscription };
          
          if (user) {
            enrichedInscription.userNom = user.nom;
            enrichedInscription.userPrenom = user.prenom;
            enrichedInscription.userEmail = user.email;
            enrichedInscription.userTelephone = (user as any).telephone || 'Non renseigné';
          }
          
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
        console.error('Erreur lors de l\'enrichissement complet:', error);
        return of(inscriptions);
      })
    );
  }
}