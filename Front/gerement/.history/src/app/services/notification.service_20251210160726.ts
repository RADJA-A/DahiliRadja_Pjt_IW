import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8083/api/notifications';

  constructor(private http: HttpClient) {}

  // Toutes mes notifications
  getMesNotifications(userId: number): Observable<Notification[]> {
    console.log(`Fetching notifications for user ${userId} from ${this.apiUrl}/user/${userId}`);
    
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(data => console.log(`Received ${data?.length || 0} notifications:`, data)),
      catchError(this.handleError<Notification[]>('getMesNotifications', []))
    );
  }

  // Notifications non lues
  getNotificationsNonLues(userId: number): Observable<Notification[]> {
    console.log(`Fetching unread notifications for user ${userId}`);
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/non-lues`).pipe(
      tap(data => console.log(`Received ${data?.length || 0} unread notifications`)),
      catchError(this.handleError<Notification[]>('getNotificationsNonLues', []))
    );
  }

  // Marquer comme lue
  marquerCommeLue(notificationId: number, userId: number): Observable<Notification> {
    console.log(`Marking notification ${notificationId} as read for user ${userId}`);
    return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/marquer-lue`, {}, {
      headers: { 'User-Id': userId.toString() }
    }).pipe(
      tap(data => console.log('Notification marked as read:', data)),
      catchError(this.handleError<Notification>('marquerCommeLue'))
    );
  }

  // Marquer toutes comme lues
  marquerToutesLues(userId: number): Observable<void> {
    console.log(`Marking all notifications as read for user ${userId}`);
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/marquer-toutes-lues`, {}).pipe(
      tap(() => console.log('All notifications marked as read')),
      catchError(this.handleError<void>('marquerToutesLues'))
    );
  }

  // Supprimer notification
  supprimerNotification(notificationId: number, userId: number): Observable<void> {
    console.log(`Deleting notification ${notificationId} for user ${userId}`);
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`, {
      headers: { 'User-Id': userId.toString() }
    }).pipe(
      tap(() => console.log('Notification deleted')),
      catchError(this.handleError<void>('supprimerNotification'))
    );
  }

  // Get notification statistics
  getStatistiques(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}/stats`).pipe(
      catchError(this.handleError<any>('getStatistiques', {}))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      if (error.status === 0) {
        console.error('Client-side or network error:', error.error);
      } else {
        console.error(`Backend returned code ${error.status}, body was:`, error.error);
      }
      
      // Return an empty result to keep the app running
      return of(result as T);
    };
  }
}