import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Inscription {
  id?: number;
  userId: number;
  evenementId: number;
  dateInscription?: string;
  
}

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private apiUrl = 'http://localhost:8084/api/inscriptions';

  constructor(private http: HttpClient) {}

  // S'inscrire
  inscrire(inscription: Inscription): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, inscription);
  }

  // Se désinscrire
  desinscrire(inscriptionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${inscriptionId}`);
  }

  // Mes inscriptions
  getMesInscriptions(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Participants d'un événement (pour organisateur)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`);
  }
}