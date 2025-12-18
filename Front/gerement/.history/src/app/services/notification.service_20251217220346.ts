import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, throwError, of } from 'rxjs';

export interface Notification {
  id?: number;
  userId: number;
  titre: string;
  message: string;
  type: string;
  evenementId?: number;
  inscriptionId?: number;
  lu: boolean;
  dateCreation?: string;
  dateLecture?: string;
}

export interface NotificationStats {
  total: number;
  nonLues: number;
  lues: number;
  parType: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8083/api/notifications';

  constructor(private http: HttpClient) {}


  getMesNotifications(userId: number): Observable<Notification[]> {
    console.log(`📥 Fetching notifications for user ${userId} from ${this.apiUrl}/user/${userId}`);
    
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(data => console.log(`✅ Received ${data?.length || 0} notifications:`, data)),
      catchError(error => {
        console.error('❌ Error in getMesNotifications:', error);
        return of([]);
      })
    );
  }

 
  getNotificationsNonLues(userId: number): Observable<Notification[]> {
    console.log(`📥 Fetching unread notifications for user ${userId}`);
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/non-lues`).pipe(
      tap(data => console.log(`✅ Received ${data?.length || 0} unread notifications`)),
      catchError(error => {
        console.error('❌ Error in getNotificationsNonLues:', error);
        return of([]);
      })
    );
  }


  getNotificationsLues(userId: number): Observable<Notification[]> {
    console.log(`📥 Fetching read notifications for user ${userId}`);
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/lues`).pipe(
      tap(data => console.log(`✅ Received ${data?.length || 0} read notifications`)),
      catchError(error => {
        console.error('❌ Error in getNotificationsLues:', error);
        return of([]);
      })
    );
  }


  marquerCommeLue(notificationId: number, userId: number): Observable<Notification> {
    console.log(`📝 Marking notification ${notificationId} as read for user ${userId}`);
    return this.http.put<Notification>(
      `${this.apiUrl}/${notificationId}/marquer-lue`, 
      {},
      { headers: { 'User-Id': userId.toString() } }
    ).pipe(
      tap(data => console.log('✅ Notification marked as read:', data)),
      catchError(error => {
        console.error('❌ Error in marquerCommeLue:', error);
        return throwError(() => error);
      })
    );
  }


  marquerToutesLues(userId: number): Observable<void> {
    console.log(`📝 Marking all notifications as read for user ${userId}`);
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/marquer-toutes-lues`, {}).pipe(
      tap(() => console.log('✅ All notifications marked as read')),
      catchError(error => {
        console.error('❌ Error in marquerToutesLues:', error);
        return throwError(() => error);
      })
    );
  }


  supprimerNotification(notificationId: number, userId: number): Observable<void> {
    console.log(`🗑️ Deleting notification ${notificationId} for user ${userId}`);
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`, {
      headers: { 'User-Id': userId.toString() }
    }).pipe(
      tap(() => console.log('✅ Notification deleted')),
      catchError(error => {
        console.error('❌ Error in supprimerNotification:', error);
        return throwError(() => error);
      })
    );
  }


  supprimerNotificationsLues(userId: number): Observable<void> {
    console.log(`🗑️ Deleting all read notifications for user ${userId}`);
    return this.http.delete<void>(`${this.apiUrl}/user/${userId}/supprimer-lues`).pipe(
      tap(() => console.log('✅ All read notifications deleted')),
      catchError(error => {
        console.error('❌ Error in supprimerNotificationsLues:', error);
        return throwError(() => error);
      })
    );
  }


  getStatistiques(userId: number): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.apiUrl}/user/${userId}/statistiques`).pipe(
      tap(stats => console.log('✅ Statistics received:', stats)),
      catchError(error => {
        console.error('❌ Error in getStatistiques:', error);
        return throwError(() => error);
      })
    );
  }


  envoyerConfirmationInscription(
    userId: number, 
    evenementId: number, 
    titreEvenement: string, 
    inscriptionId: number
  ): Observable<void> {
    console.log(`📧 Sending confirmation notification to user ${userId} for event ${evenementId}`);
    
    const params = {
      userId: userId.toString(),
      evenementId: evenementId.toString(),
      titreEvenement: titreEvenement,
      inscriptionId: inscriptionId.toString()
    };

    return this.http.post<void>(`${this.apiUrl}/confirmation-inscription`, null, { params }).pipe(
      tap(() => console.log('✅ Confirmation notification sent')),
      catchError(error => {
        console.error('❌ Error sending confirmation notification:', error);
        return throwError(() => error);
      })
    );
  }


  envoyerAnnulationInscription(
    userId: number, 
    evenementId: number, 
    titreEvenement: string
  ): Observable<void> {
    console.log(`📧 Sending cancellation notification to user ${userId} for event ${evenementId}`);
    
    const params = {
      userId: userId.toString(),
      evenementId: evenementId.toString(),
      titreEvenement: titreEvenement
    };

    return this.http.post<void>(`${this.apiUrl}/annulation-inscription`, null, { params }).pipe(
      tap(() => console.log('✅ Cancellation notification sent')),
      catchError(error => {
        console.error('❌ Error sending cancellation notification:', error);
        return throwError(() => error);
      })
    );
  }

  envoyerModificationEvenement(
    userId: number, 
    evenementId: number, 
    titreEvenement: string, 
    details: string
  ): Observable<void> {
    console.log(`📧 Sending modification notification to user ${userId} for event ${evenementId}`);
    
    const params = {
      userId: userId.toString(),
      evenementId: evenementId.toString(),
      titreEvenement: titreEvenement,
      details: details
    };

    return this.http.post<void>(`${this.apiUrl}/modification-evenement`, null, { params }).pipe(
      tap(() => console.log('✅ Modification notification sent')),
      catchError(error => {
        console.error('❌ Error sending modification notification:', error);
        return throwError(() => error);
      })
    );
  }

  
  envoyerAnnulationEvenement(
    userId: number, 
    evenementId: number, 
    titreEvenement: string
  ): Observable<void> {
    console.log(`📧 Sending event cancellation notification to user ${userId} for event ${evenementId}`);
    
    const params = {
      userId: userId.toString(),
      evenementId: evenementId.toString(),
      titreEvenement: titreEvenement
    };

    return this.http.post<void>(`${this.apiUrl}/annulation-evenement`, null, { params }).pipe(
      tap(() => console.log('✅ Event cancellation notification sent')),
      catchError(error => {
        console.error('❌ Error sending event cancellation notification:', error);
        return throwError(() => error);
      })
    );
  }

 
  envoyerRappelEvenement(
    userId: number, 
    evenementId: number, 
    titreEvenement: string, 
    dateEvenement: Date | string
  ): Observable<void> {
    console.log(`📧 Sending reminder notification to user ${userId} for event ${evenementId}`);
    
    // Convertir la date en format ISO si nécessaire
    const dateISO = typeof dateEvenement === 'string' 
      ? dateEvenement 
      : dateEvenement.toISOString();
    
    const params = {
      userId: userId.toString(),
      evenementId: evenementId.toString(),
      titreEvenement: titreEvenement,
      dateEvenement: dateISO
    };

    return this.http.post<void>(`${this.apiUrl}/rappel-evenement`, null, { params }).pipe(
      tap(() => console.log('✅ Reminder notification sent')),
      catchError(error => {
        console.error('❌ Error sending reminder notification:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Envoyer une notification à tous les participants d'un événement
   * Utile pour les modifications ou annulations
   */
  notifierTousLesParticipants(
    userIds: number[], 
    evenementId: number, 
    titreEvenement: string, 
    type: 'modification' | 'annulation',
    details?: string
  ): Observable<void[]> {
    console.log(`📧 Notifying ${userIds.length} participants for event ${evenementId}`);
    
    const notifications = userIds.map(userId => {
      if (type === 'modification' && details) {
        return this.envoyerModificationEvenement(userId, evenementId, titreEvenement, details);
      } else if (type === 'annulation') {
        return this.envoyerAnnulationEvenement(userId, evenementId, titreEvenement);
      }
      return of(undefined);
    });

    return new Observable(observer => {
      Promise.all(notifications.map(n => n.toPromise()))
        .then(results => {
          console.log(`✅ Successfully notified ${userIds.length} participants`);
          observer.next(results as void[]);
          observer.complete();
        })
        .catch(error => {
          console.error('❌ Error notifying participants:', error);
          observer.error(error);
        });
    });
  }
}