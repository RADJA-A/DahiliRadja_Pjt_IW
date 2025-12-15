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
    
    // IMPORTANT: Vérifier le format de la requête attendu par votre backend
    // Option 1: Si votre backend attend { ids: [1, 2, 3] }
    return this.http.post<User[]>(`${this.userApiUrl}/batch`, { ids: userIds }, { headers }).pipe(
      map(users => {
        console.log('✅ Utilisateurs récupérés depuis l\'API:', users);
        return users;
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
        console.log('📝 Création d\'utilisateurs de test en attendant...');
        
        // Créer des utilisateurs de test avec TOUTES les propriétés
        const fakeUsers: User[] = userIds.map((id, index) => ({
          id: id,
          nom: `TestNom${id}`,
          prenom: `TestPrenom${id}`,
          email: `test${id}@example.com`,
          telephone: `06${String(id).padStart(8, '0')}`,
          role: 'PARTICIPANT',
          active: true
        }));
        
        console.log('📝 Utilisateurs de test créés:', fakeUsers);
        return of(fakeUsers);
      })
    );
    
    // Option 2: Si votre backend attend simplement un tableau [1, 2, 3]
    // Décommenter cette ligne et commenter la ligne précédente
    // return this.http.post<User[]>(`${this.userApiUrl}/batch`, userIds, { headers }).pipe(...)
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
  getUserById(id: number): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.userApiUrl}/${id}`, { headers }).pipe(
      catchError(error => {
        console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
        // Retourner un utilisateur de test
        return of({
          id: id,
          nom: `TestNom${id}`,
          prenom: `TestPrenom${id}`,
          email: `test${id}@example.com`,
          telephone: `06${String(id).padStart(8, '0')}`,
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