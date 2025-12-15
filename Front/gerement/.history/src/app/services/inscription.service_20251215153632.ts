import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Inscription {
  id?: number;
  userId: number;
  evenementId: number;
  
  // Champs optionnels pour l'affichage (seront remplis par le frontend si nécessaire)
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
  // Port 8082 pour le microservice inscriptions (selon votre configuration)
  private apiUrl = 'http://localhost:8084/api/inscriptions';

  constructor(private http: HttpClient) {}

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

  // Obtenir toutes les inscriptions d'un utilisateur
  getMesInscriptions(userId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Obtenir tous les participants d'un événement (pour organisateur)
  getParticipants(evenementId: number): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/evenement/${evenementId}`);
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

  // Méthode pour enrichir les inscriptions avec les infos utilisateur
  // (Utilisez cette méthode si votre backend ne le fait pas)
  enrichirInscriptionsAvecUtilisateurs(inscriptions: Inscription[]): Observable<Inscription[]> {
    // Cette méthode suppose que vous avez un UserService pour récupérer les infos utilisateur
    return new Observable<Inscription[]>(observer => {
      // Simuler l'enrichissement des données
      const inscriptionsEnrichies = inscriptions.map(inscription => ({
        ...inscription,
        userNom: `Utilisateur ${inscription.userId}`,
        userPrenom: 'Prénom',
        userEmail: `user${inscription.userId}@example.com`,
        userTelephone: '01 23 45 67 89'
      }));
      
      observer.next(inscriptionsEnrichies);
      observer.complete();
    });
  }

  // Méthode utilitaire pour créer une inscription (si vous avez besoin de tester)
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