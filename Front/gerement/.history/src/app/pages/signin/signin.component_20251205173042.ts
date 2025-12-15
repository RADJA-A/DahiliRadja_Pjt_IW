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
    if (this.signupForm.valid) {
      const userData = this.signupForm.value;
      
      this.authService.signup(userData).subscribe({
        next: (response) => {
          console.log('Signup successful', response);
          this.successMessage = 'Compte créé avec succès! Redirection...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('Signup failed - Full error:', error);
          console.error('Error status:', error.status);
          console.error('Error statusText:', error.statusText);
          console.error('Error body:', error.error);
          
          let errorMsg = 'Erreur lors de la création du compte';
          if (error.error?.message) {
            errorMsg = error.error.message;
          } else if (error.error?.error) {
            errorMsg = error.error.error;
          } else if (error.statusText) {
            errorMsg = error.statusText;
          }
          this.errorMessage = errorMsg;
        }
      });
    }
  }
}
