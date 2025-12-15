import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      
      console.log('Login attempt for:', email);
      
      // Nettoyer l'ancien localStorage
      localStorage.clear();
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          console.log('=== RÉPONSE COMPLÈTE DU LOGIN ===');
          console.log('Response object:', response);
          
          // VÉRIFIEZ LA STRUCTURE EXACTE DE LA RÉPONSE
          console.log('Type de réponse:', typeof response);
          
          // Si la réponse est une chaîne, essayez de la parser
          if (typeof response === 'string') {
            try {
              response = JSON.parse(response);
              console.log('Parsed string response:', response);
            } catch (e) {
              console.error('Cannot parse response as JSON:', e);
            }
          }
          
          // Afficher TOUTES les clés de l'objet
          if (response && typeof response === 'object') {
            console.log('Clés disponibles dans la réponse:', Object.keys(response));
            
            // Afficher toutes les propriétés
            for (const key in response) {
              console.log(`${key}:`, response[key], '(type:', typeof response[key], ')');
            }
          }
          
          if (!response) {
            this.errorMessage = 'Réponse vide du serveur';
            return;
          }
          
          // EXTRAIRE LES DONNÉES CORRECTEMENT
          const token = this.extractToken(response);
          const userId = this.extractUserId(response);
          const userEmail = this.extractEmail(response, email);
          const userNom = this.extractNom(response);
          const userPrenom = this.extractPrenom(response);
          const userRole = this.extractRole(response);
          
          console.log('=== VALEURS EXTRAITES ===');
          console.log('Token:', token ? '✓' : '✗');
          console.log('User ID:', userId);
          console.log('Email:', userEmail);
          console.log('Nom:', userNom);
          console.log('Prénom:', userPrenom);
          console.log('Rôle:', userRole);
          
          if (!token) {
            this.errorMessage = 'Token manquant dans la réponse';
            return;
          }
          
          // Stocker dans localStorage
          const userData = {
            id: userId,
            email: userEmail,
            nom: userNom,
            prenom: userPrenom,
            role: userRole
          };
          
          console.log('💾 Stockage des données utilisateur:', userData);
          
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', token);
          
          // Vérifier le stockage
          const storedUser = localStorage.getItem('user');
          console.log('✅ Vérification - Données stockées:', storedUser);
          
          // Rediriger
          if (userRole === 'ORGANIZER' || userRole === 'ADMIN') {
            this.router.navigate(['/organisateur/dashboard']);
          } else if (userRole === 'PARTICIPANT') {
            this.router.navigate(['/participant/evenements']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur de login:', error);
          
          if (error.status === 401 || error.status === 400) {
            this.errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur';
          } else {
            this.errorMessage = 'Une erreur est survenue';
          }
        }
      });
    }
  }

  // Méthodes d'extraction
  
  private extractToken(response: any): string {
    // Cherche le token dans différentes propriétés
    return response.token || response.accessToken || response.jwt || response.access_token || '';
  }
  
  private extractUserId(response: any): number {
    // Cherche l'ID dans TOUTES les propriétés possibles
    const possibleIdFields = [
      'id', 'userId', 'user_id', 'Id', 'ID', 'user.id',
      'utilisateurId', 'utilisateur_id', 'clientId', 'client_id'
    ];
    
    for (const field of possibleIdFields) {
      // Accès aux propriétés imbriquées (ex: user.id)
      if (field.includes('.')) {
        const parts = field.split('.');
        let value = response;
        for (const part of parts) {
          if (value && value[part] !== undefined) {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }
        if (value !== undefined && !isNaN(value) && value > 0) {
          console.log(`✅ ID trouvé dans ${field}:`, value);
          return Number(value);
        }
      } 
      // Accès direct
      else if (response[field] !== undefined && !isNaN(response[field]) && response[field] > 0) {
        console.log(`✅ ID trouvé dans ${field}:`, response[field]);
        return Number(response[field]);
      }
    }
    
    // Si aucun ID trouvé, chercher n'importe quel nombre > 0
    for (const key in response) {
      const value = response[key];
      if (!isNaN(value) && value > 0 && typeof value !== 'boolean') {
        console.log(`✅ ID trouvé (nombre positif) dans ${key}:`, value);
        return Number(value);
      }
    }
    
    console.warn('⚠️ Aucun ID trouvé dans la réponse');
    return 0;
  }
  
  private extractEmail(response: any, fallbackEmail: string): string {
    return response.email || response.userEmail || response.mail || response.user?.email || fallbackEmail;
  }
  
  private extractNom(response: any): string {
    return response.nom || response.lastName || response.name || response.user?.nom || '';
  }
  
  private extractPrenom(response: any): string {
    return response.prenom || response.firstName || response.givenName || response.user?.prenom || '';
  }
  
  private extractRole(response: any): string {
    return response.role || response.userRole || response.type || response.user?.role || 'PARTICIPANT';
  }

  // Test manuel de la réponse
  testResponseStructure() {
    console.log('🧪 Test de la structure de réponse...');
    
    // Simulez une réponse pour voir la structure
    const testResponses = [
      { token: 'abc123', id: 1, email: 'test@test.com', nom: 'Test', prenom: 'User', role: 'ORGANIZER' },
      { jwt: 'abc123', userId: 2, email: 'test@test.com', lastName: 'Test', firstName: 'User', userRole: 'PARTICIPANT' },
      { access_token: 'abc123', user_id: 3, mail: 'test@test.com', name: 'Test User', type: 'ADMIN' },
      { token: 'abc123', utilisateurId: 4, email: 'test@test.com' }
    ];
    
    testResponses.forEach((resp, index) => {
      console.log(`\nTest ${index + 1}:`, resp);
      console.log('ID extrait:', this.extractUserId(resp));
    });
  }
}