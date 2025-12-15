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
  role: string; // 'PARTICIPANT', 'ORGANIZER', 'ADMIN'
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
  
  private apiUrl = 'http://localhost:8081/api/auth'; // Port de votre service auth
  private userApiUrl = 'http://localhost:8081/api/users'; // URL pour le user microservice

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

  // === NOUVELLE METHODE : Récupérer des utilisateurs par IDs ===
  getUsersByIds(userIds: number[]): Observable<User[]> {
    if (!userIds || userIds.length === 0) {
      return of([]);
    }
    
    const headers = this.getAuthHeaders();
    return this.http.post<User[]>(`${this.userApiUrl}/batch`, { ids: userIds }, { headers }).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        // En cas d'erreur, créer des utilisateurs fictifs
        const fakeUsers: User[] = userIds.map(id => ({
          id: id,
          nom: 'Utilisateur',
          prenom: 'Inconnu',
          email: `user${id}@example.com`,
          role: 'PARTICIPANT',
          active: true
        }));
        return of(fakeUsers);
      })
    );
  }

  // === NOUVELLE METHODE : Récupérer un utilisateur par email ===
  getUserByEmail(email: string): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.userApiUrl}/by-email`, { 
      headers,
      params: { email: email }
    });
  }

  // === NOUVELLE METHODE : Récupérer un utilisateur par ID ===
  getUserById(id: number): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.userApiUrl}/${id}`, { headers });
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
  const headers: { [key: string]: string } = {};
  
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
      // Sauvegarder le token
      localStorage.setItem('token', response.token);
      
      // Créer l'objet utilisateur
      const user: User = {
        id: response.id,
        email: response.email,
        nom: response.nom,
        prenom: response.prenom,
        role: response.role
      };
      
      // Sauvegarder l'utilisateur
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