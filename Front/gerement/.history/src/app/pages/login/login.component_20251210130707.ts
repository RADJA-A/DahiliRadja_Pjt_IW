import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

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
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login successful - FULL RESPONSE:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', Object.keys(response));
          
          // Check if response is what we expect
          if (response && response.token) {
            // Store user data in localStorage
            const userData = {
              token: response.token,
              email: response.email,
              nom: response.nom,
              prenom: response.prenom,
              role: response.role,
              id: response.id || response.userId // Try both possibilities
            };
            
            console.log('Storing user data:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', response.token);
            
            // Navigate based on user role
            console.log('User role for navigation:', response.role);
            if (response.role === 'ORGANIZER' || response.role === 'ADMIN') {
              this.router.navigate(['/organisateur/dashboard']);
            } else if (response.role === 'PARTICIPANT') {
              this.router.navigate(['/participant/evenements']);
            } else {
              this.router.navigate(['/']);
            }
          } else {
            console.error('Unexpected response format:', response);
            this.errorMessage = 'Invalid response from server';
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          console.error('Error details:', error.error);
          this.errorMessage = error.error?.message || 'Invalid email or password';
        }
      });
    }
  }
}