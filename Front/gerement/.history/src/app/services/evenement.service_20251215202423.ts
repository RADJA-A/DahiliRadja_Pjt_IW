import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, of, map, forkJoin } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NotificationService } from './notification.service';

export interface Evenement {
  id?: number;
  titre: string;
  type: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  capaciteMax: number;
  nombreInscrits?: number;
  organisateurId: number;
  statut?: string;
  imageUrl?: string;
  programme?: string;
  placesDisponibles?: number;
}

@Injectable({
  providedIn: 'root' 
})
export class EvenementService {
  private apiUrl = 'http://localhost:8082/api/evenements';
  
  // Pour éviter la dépendance circulaire avec InscriptionService
  private inscriptionService?: any;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  // =====================================================================
  // SETTER pour InscriptionService (évite dépendance circulaire)
  // =====================================================================
  setInscriptionService(service: any) {
    this.inscriptionService = service;
    console.log('✅ InscriptionService lié à EvenementService');
  }

  // =====================================================================
  // MÉTHODES INCHANGÉES
  // =====================================================================

  // Tous les événements
  getAllEvenements(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(this.apiUrl);
  }

  // Événements d'un organisateur
  getMesEvenements(organisateurId: number): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/organisateur/${organisateurId}`);
  }

  // Un événement par ID
  getEvenementById(id: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.apiUrl}/${id}`);
  }

  // Créer événement
  createEvenement(evenement: Evenement): Observable<Evenement> {
    return this.http.post<Evenement>(this.apiUrl, evenement);
  }

  // =====================================================================
  // Modifier événement - AVEC NOTIFICATION AUX PARTICIPANTS
  // =====================================================================
  updateEvenement(id: number, evenement: any, userId: number): Observable<Evenement> {
    return this.http.put<Evenement>(`${this.apiUrl}/${id}`, evenement, {
      headers: { 'User-Id': userId.toString() }
    }).pipe(
      switchMap((evenementModifie: Evenement) => {
        console.log('✅ Événement modifié:', evenementModifie);
        
        // Si on a le service d'inscription, notifier les participants
        if (this.inscriptionService) {
          return this.inscriptionService.getParticipants(id).pipe(
            switchMap((participants: any[]) => {
              if (participants && participants.length > 0) {
                console.log(`📧 Notification de ${participants.length} participants...`);
                
                const userIds = participants.map((p: any) => p.userId);
                const details = 'L\'événement a été modifié. Consultez les détails pour plus d\'informations.';
                
                return this.notificationService.notifierTousLesParticipants(
                  userIds,
                  id,
                  evenement.titre || evenementModifie.titre,
                  'modification',
                  details
                ).pipe(
                  tap(() => console.log('✅ Notifications envoyées à tous les participants')),
                  catchError(error => {
                    console.warn('⚠️ Erreur envoi notifications (modification quand même effectuée):', error);
                    return of([]);
                  }),
                  map(() => evenementModifie)
                );
              }
              console.log('ℹ️ Aucun participant à notifier');
              return of(evenementModifie);
            }),
            catchError(error => {
              console.warn('⚠️ Erreur récupération participants:', error);
              return of(evenementModifie);
            })
          );
        }
        
        console.log('⚠️ InscriptionService non disponible, pas de notifications envoyées');
        return of(evenementModifie);
      })
    );
  }

  // =====================================================================
  // NOUVELLE MÉTHODE : Annuler événement avec notifications
  // =====================================================================
  annulerEvenement(id: number, userId: number): Observable<Evenement> {
    return this.getEvenementById(id).pipe(
      switchMap((evenement: Evenement) => {
        // Modifier le statut à ANNULE
        evenement.statut = 'ANNULE';
        
        return this.http.put<Evenement>(`${this.apiUrl}/${id}`, evenement, {
          headers: { 'User-Id': userId.toString() }
        }).pipe(
          switchMap((evenementAnnule: Evenement) => {
            console.log('✅ Événement annulé:', evenementAnnule);
            
            // Notifier les participants
            if (this.inscriptionService) {
              return this.inscriptionService.getParticipants(id).pipe(
                switchMap((participants: any[]) => {
                  if (participants && participants.length > 0) {
                    console.log(`📧 Notification d'annulation à ${participants.length} participants...`);
                    
                    const userIds = participants.map((p: any) => p.userId);
                    
                    return this.notificationService.notifierTousLesParticipants(
                      userIds,
                      id,
                      evenement.titre!,
                      'annulation'
                    ).pipe(
                      tap(() => console.log('✅ Notifications d\'annulation envoyées')),
                      catchError(error => {
                        console.warn('⚠️ Erreur envoi notifications (annulation quand même effectuée):', error);
                        return of([]);
                      }),
                      map(() => evenementAnnule)
                    );
                  }
                  console.log('ℹ️ Aucun participant à notifier');
                  return of(evenementAnnule);
                }),
                catchError(error => {
                  console.warn('⚠️ Erreur récupération participants:', error);
                  return of(evenementAnnule);
                })
              );
            }
            
            console.log('⚠️ InscriptionService non disponible, pas de notifications envoyées');
            return of(evenementAnnule);
          })
        );
      })
    );
  }

  // =====================================================================
  // Supprimer événement - GARDE LA MÉTHODE ORIGINALE
  // =====================================================================
  deleteEvenement(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: { 'User-Id': userId.toString() }
    }).pipe(
      tap(() => console.log('✅ Événement supprimé'))
    );
  }

  // =====================================================================
  // MÉTHODES INCHANGÉES (suite)
  // =====================================================================

  // Rechercher
  searchEvenements(params: any): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/search`, { params });
  }

  // Statistiques
  getStatistiques(organisateurId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistiques/${organisateurId}`);
  }

  /**
   * Calcule le statut d'un événement côté frontend
   * Utile pour afficher le bon statut sans recharger la page
   */
  calculerStatut(evenement: Evenement): string {
    const now = new Date();
    const dateDebut = new Date(evenement.dateDebut);
    const dateFin = new Date(evenement.dateFin);
    
    // Si l'événement est annulé, retourner directement
    if (evenement.statut === 'ANNULE') {
      return 'ANNULE';
    }
    
    if (dateDebut > now) {
      return 'AVENIR';
    } else if (dateDebut < now && dateFin > now) {
      return 'ENCOURS';
    } else {
      return 'TERMINE';
    }
  }

  /**
   * Récupère et met à jour les statuts côté backend
   */
  mettreAJourStatuts(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/update-status`, {});
  }

  // =====================================================================
  // MÉTHODE UTILITAIRE : Envoyer rappel avant événement
  // =====================================================================
  /**
   * Envoie un rappel à tous les participants d'un événement
   * Utile pour rappeler un événement 24h avant par exemple
   */
  envoyerRappelEvenement(evenementId: number): Observable<void> {
    return this.getEvenementById(evenementId).pipe(
      switchMap((evenement: Evenement) => {
        if (this.inscriptionService) {
          return this.inscriptionService.getParticipants(evenementId).pipe(
            switchMap((participants: any[]) => {
              if (participants && participants.length > 0) {
                console.log(`📧 Envoi de rappels à ${participants.length} participants...`);
                
                // Créer un tableau d'observables pour les rappels
                const rappelObservables = participants.map((p: any) => 
                  this.notificationService.envoyerRappelEvenement(
                    p.userId,
                    evenementId,
                    evenement.titre!,
                    evenement.dateDebut
                  ).pipe(
                    catchError(error => {
                      console.error(`❌ Erreur envoi rappel pour user ${p.userId}:`, error);
                      return of(null);
                    })
                  )
                );
                
                // Utiliser forkJoin pour attendre tous les rappels
                return forkJoin(rappelObservables).pipe(
                  tap(() => console.log('✅ Tous les rappels ont été envoyés')),
                  map(() => undefined),
                  catchError(error => {
                    console.error('❌ Erreur générale envoi rappels:', error);
                    return of(undefined);
                  })
                );
              }
              console.log('ℹ️ Aucun participant à notifier');
              return of(undefined);
            }),
            catchError(error => {
              console.error('❌ Erreur récupération participants:', error);
              return of(undefined);
            })
          );
        }
        console.log('⚠️ InscriptionService non disponible');
        return of(undefined);
      })
    );
  }
}