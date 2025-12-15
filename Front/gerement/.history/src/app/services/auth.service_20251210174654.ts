import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: string; // 'PARTICIPANT' | 'ORGANISATEUR' | 'ADMIN'
}

export interface LoginResponse {
  user: User;
  token?: string; // Si vous utilisez JWT
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = 'http://localhost:8080/api/auth'; // Port de votre service auth

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.loadUserFromStorage();
  }

  // === LOGIN / LOGOUT ===
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  signup(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signup`, userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Si JWT
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
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

  isOrganisateur(): boolean {
    return this.getUserRole() === 'ORGANISATEUR';
  }

  isParticipant(): boolean {
    return this.getUserRole() === 'PARTICIPANT';
  }

  // === HEADERS POUR LES REQUÊTES ===
  getAuthHeaders(): { [header: string]: string } {
    const headers: any = {};
    
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Pour les microservices sans JWT
      const user = localStorage.getItem('user');
      if (user) {
        const userObj = JSON.parse(user);
        headers['User-Id'] = userObj.id.toString();
      }
    }
    
    return headers;
  }

  // === PRIVATE METHODS ===
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