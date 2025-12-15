import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id?: number;
  userId: number;
  titre: string;
  message: string;
  type: string;
  evenementId?: number;
  lu: boolean;
  dateCreation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8083/api/notifications';

  constructor(private http: HttpClient) {}

  // Toutes mes notifications
  getMesNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Notifications non lues
  getNotificationsNonLues(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${userId}/non-lues`);
  }

  // Marquer comme lue
  marquerCommeLue(notificationId: number, userId: number): Observable<Notification> {
    return this.http.put<Notification>(`${this.apiUrl}/${notificationId}/marquer-lue`, {}, {
      headers: { 'User-Id': userId.toString() }
    });
  }

  // Marquer toutes comme lues
  marquerToutesLues(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/user/${userId}/marquer-toutes-lues`, {});
  }

  // Supprimer notification
  supprimerNotification(notificationId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`, {
      headers: { 'User-Id': userId.toString() }
    });
  }
}