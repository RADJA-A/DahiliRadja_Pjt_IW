import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['PARTICIPANT', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      const userData = this.signupForm.value;
      
      console.log('=== SIGNUP ATTEMPT ===');
      console.log('User data:', userData);
      
      this.authService.signup(userData).subscribe({
        next: (response: any) => {
          console.log('=== SIGNUP SUCCESS ===');
          console.log('Full response:', response);
          
          this.isLoading = false;
          
          // Handle different response formats
          if (response) {
            // New format: Direct user object
            if (response.email) { // Check if response is a User object
              this.successMessage = 'Compte créé avec succès! Redirection vers la page de connexion...';
              console.log('User created:', response);
              
              // Optional: Auto-login after signup
              // this.autoLoginAfterSignup(userData.email, userData.password);
              
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            }
            // Legacy format: Wrapped response
            else if (response.user || response.id) {
              this.successMessage = 'Compte créé avec succès! Redirection...';
              console.log('User created (legacy format):', response);
              
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            }
            // Other formats
            else if (response.message) {
              this.successMessage = response.message;
              console.log('Success message:', response.message);
              
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            }
            else {
              // Default success handling
              this.successMessage = 'Compte créé avec succès!';
              console.log('Unknown response format, but request succeeded');
              
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            }
          }
        },
        error: (error) => {
          console.error('=== SIGNUP ERROR ===');
          console.error('Error object:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error response:', error.error);
          
          this.isLoading = false;
          
          // Handle different error formats
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.error?.error) {
            this.errorMessage = error.error.error;
          } else if (error.message) {
            this.errorMessage = error.message;
          } else if (error.statusText) {
            this.errorMessage = error.statusText;
          } else {
            this.errorMessage = 'Erreur lors de la création du compte';
          }
          
          // Specific error handling
          if (error.status === 409) {
            this.errorMessage = 'Un compte avec cet email existe déjà';
          } else if (error.status === 400) {
            this.errorMessage = 'Données invalides. Vérifiez les informations saisies';
          } else if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion';
          }
        }
      });
    }
  }

  // Optional: Auto-login after successful signup
  private autoLoginAfterSignup(email: string, password: string): void {
    console.log('Attempting auto-login after signup...');
    
    this.authService.login(email, password).subscribe({
      next: (loginResponse: any) => {
        console.log('Auto-login successful:', loginResponse);
        
        if (loginResponse && loginResponse.user && loginResponse.token) {
          localStorage.setItem('user', JSON.stringify(loginResponse.user));
          localStorage.setItem('token', loginResponse.token);
          
          // Redirect based on role
          if (loginResponse.user.role === 'ORGANIZER') {
            this.router.navigate(['/organisateur/dashboard']);
          } else {
            this.router.navigate(['/participant/evenements']);
          }
        }
      },
      error: (loginError) => {
        console.warn('Auto-login failed, redirecting to login page:', loginError);
        this.router.navigate(['/login']);
      }
    });
  }

  // Reset form
  resetForm(): void {
    this.signupForm.reset({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      role: 'PARTICIPANT'
    });
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Test signup method (optional)
  testSignup(): void {
    console.log('=== TEST SIGNUP ===');
    
    // Fill form with test data
    this.signupForm.setValue({
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      password: 'password123',
      role: 'PARTICIPANT'
    });
    
    this.onSubmit();
  }

  // Test organizer signup (optional)
  testOrganizerSignup(): void {
    console.log('=== TEST ORGANIZER SIGNUP ===');
    
    // Fill form with organizer test data
    this.signupForm.setValue({
      nom: 'Organizer',
      prenom: 'Test',
      email: 'organizer@test.com',
      password: 'password123',
      role: 'ORGANIZER' // Note: Check what role value your backend expects ORGANIZER
    });
    
    this.onSubmit();
  }
}