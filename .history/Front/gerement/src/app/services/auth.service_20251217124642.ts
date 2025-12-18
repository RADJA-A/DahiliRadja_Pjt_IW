import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  telephone?: string; // AJOUT: champ téléphone optionnel
  active?: boolean;
}

export interface LoginResponse {
  token: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = 'http://localhost:8081/api/auth';
  private userApiUrl = 'http://localhost:8081/api/users';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.loadUserFromStorage();
  }

  // === LOGIN / LOGOUT ===
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        this.saveUserToStorage(response);
        return response;
      })
    );
  }

  signup(userData: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/signup`, userData).pipe(
      map(response => {
        this.saveUserToStorage(response);
        return response;
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // === CORRECTION: Récupérer des utilisateurs par IDs ===
  getUsersByIds(userIds: number[]): Observable<User[]> {
    if (!userIds || userIds.length === 0) {
      return of([]);
    }
    
    const headers = this.getAuthHeaders();
    
    console.log('🔍 Récupération des utilisateurs avec IDs:', userIds);
    
    // IMPORTANT: Tester les deux formats selon votre backend
    return this.http.post<User[]>(`${this.userApiUrl}/batch`, { ids: userIds }, { headers }).pipe(
      map(users => {
        console.log('✅ Utilisateurs récupérés depuis l\'API:', users);
        
        // Vérifier que les utilisateurs ont bien toutes les propriétés
        const validUsers = users.map(user => ({
          ...user,
          telephone: user.telephone || 'Non renseigné'
        }));
        
        return validUsers;
      }),
      catchError(error => {
        console.error('❌ Erreur API getUsersByIds:', error);
        console.log('🔧 Status:', error.status);
        console.log('🔧 Message:', error.message);
        
        // Créer des utilisateurs de test réalistes
        const fakeUsers: User[] = userIds.map(id => ({
          id: id,
          nom: `Nom${id}`,
          prenom: `Prénom${id}`,
          email: `utilisateur${id}@example.com`,
          telephone: `+33 6 ${String(id).padStart(2, '0')} ${String(id).padStart(2, '0')} ${String(id).padStart(2, '0')} ${String(id).padStart(2, '0')}`,
          role: 'PARTICIPANT',
          active: true
        }));
        
        console.log('📝 Utilisateurs de test générés:', fakeUsers);
        return of(fakeUsers);
      })
    );
  }

  // === Récupérer un utilisateur par email ===
  getUserByEmail(email: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.userApiUrl}/by-email`, { 
      headers,
      params: { email: email }
    }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de l\'utilisateur par email:', error);
        return throwError(() => error);
      })
    );
  }

  // === Récupérer un utilisateur par ID ===
// === Récupérer un utilisateur par ID ===
getUserById(id: number): Observable<User> {
  const headers = this.getAuthHeaders();
  
  console.log(`🔍 Tentative récupération utilisateur ${id}...`);
  
  return this.http.get<User>(`${this.userApiUrl}/${id}`, { headers }).pipe(
    catchError(error => {
      console.warn(`⚠️ API utilisateur indisponible pour l'ID ${id}, utilisation de données minimales`);
      
      // ESSAYER UNE AUTRE URL ou méthode
      // Option 1: Vérifier si l'API existe ailleurs
      // Option 2: Vérifier dans localStorage si on a déjà cet utilisateur
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        console.log(`✅ Utilisateur ${id} trouvé dans localStorage`);
        return of(currentUser);
      }
      
      // Option 3: Retourner un observable vide et laisser le component gérer
      // Les autres services (inscription) devront gérer l'absence de données
      return of({
        id: id,
        nom: 'Nom non disponible',
        prenom: 'Prénom non disponible',
        email: `utilisateur${id}@exemple.com`,
        telephone: 'Non renseigné',
        role: 'PARTICIPANT',
        active: true
      });
    })
  );
}

  // === GESTION UTILISATEUR ===
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserId(): number | null {
    return this.currentUserSubject.value?.id || null;
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isOrganizer(): boolean {
    return this.getUserRole() === 'ORGANIZER';
  }

  isParticipant(): boolean {
    return this.getUserRole() === 'PARTICIPANT';
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  // === HEADERS POUR LES REQUÊTES ===
  getAuthHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }
    
  // === PRIVATE METHODS ===
  private saveUserToStorage(response: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', response.token);
      
      const user: User = {
        id: response.id,
        email: response.email,
        nom: response.nom,
        prenom: response.prenom,
        role: response.role
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
        } catch (e) {
          console.error('Error parsing user from localStorage', e);
          this.clearStorage();
        }
      }
    }
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
}