import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {}

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

  // Modifier événement
 // Modifier événement - CORRECTION
updateEvenement(id: number, evenement: any, userId: number): Observable<Evenement> {
  const headers = { 
    'User-Id': userId.toString(),
    'Content-Type': 'application/json'
  };
  
  console.log(`🔧 Mise à jour événement ${id} pour user ${userId}`);
  console.log('📤 Données envoyées:', evenement);
  
  return this.http.put<Evenement>(`${this.apiUrl}/${id}`, evenement, { headers })
    .pipe(
      tap(response => {
        console.log('✅ Réponse du serveur:', response);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la mise à jour:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        if (error.error) {
          console.error('❌ Erreur détaillée:', error.error);
        }
        throw error;
      })
    );
}

  // Supprimer événement
  deleteEvenement(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: { 'User-Id': userId.toString() }
    });
  }

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
}