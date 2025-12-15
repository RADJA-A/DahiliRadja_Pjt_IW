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
      catchError(error => {
        console.error('Error in getMesNotifications:', error);
        return of([]);
      })
    );
  }

  // Notifications non lues
  getNotificationsNonLues(userId: number): Observable<Notification[]> {
    console.log(`Fetching unread notifications for user ${userId}`);
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/non-lues`).pipe(
      tap(data => console.log(`Received ${data?.length || 0} unread notifications`)),
      catchError(error => {
        console.error('Error in getNotificationsNonLues:', error);
        return of([]);
      })
    );
  }

  // Marquer comme lue
  marquerCommeLue(notificationId: number, userId: number): Observable<Notification> {
    console.log(`Marking notification ${notificationId} as read for user ${userId}`);
    return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/marquer-lue`, {}, {
      headers: { 'User-Id': userId.toString() }
    }).pipe(
      tap(data => console.log('Notification marked as read:', data)),
      catchError(error => {
        console.error('Error in marquerCommeLue:', error);
        return throwError(() => error);
      })
    );
  }

  // Marquer toutes comme lues
  marquerToutesLues(userId: number): Observable<void> {
    console.log(`Marking all notifications as read for user ${userId}`);
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/marquer-toutes-lues`, {}).pipe(
      tap(() => console.log('All notifications marked as read')),
      catchError(error => {
        console.error('Error in marquerToutesLues:', error);
        return throwError(() => error);
      })
    );
  }

  // Supprimer notification
  supprimerNotification(notificationId: number, userId: number): Observable<void> {
    console.log(`Deleting notification ${notificationId} for user ${userId}`);
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`, {
      headers: { 'User-Id': userId.toString() }
    }).pipe(
      tap(() => console.log('Notification deleted')),
      catchError(error => {
        console.error('Error in supprimerNotification:', error);
        return throwError(() => error);
      })
    );
  }

  // Get notification statistics
  getStatistiques(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}/stats`).pipe(
      catchError(error => {
        console.error('Error in getStatistiques:', error);
        return throwError(() => error);
      })
    );
  }
}