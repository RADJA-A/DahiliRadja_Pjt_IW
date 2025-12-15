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
      
      this.authService.signup(userData).subscribe({
        next: (user: any) => {
          this.isLoading = false;
          this.successMessage = 'Compte créé avec succès! Redirection vers la page de connexion...';
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          
          if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.status === 409) {
            this.errorMessage = 'Un compte avec cet email existe déjà';
          } else if (error.status === 400) {
            this.errorMessage = 'Données invalides';
          } else {
            this.errorMessage = 'Erreur lors de la création du compte';
          }
        }
      });
    }
  }
}