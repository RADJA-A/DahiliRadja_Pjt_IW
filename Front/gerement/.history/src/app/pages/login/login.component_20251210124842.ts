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
          console.log('Login successful', response);
           // Navigate based on user role
          if (response.role === 'ORGANIZER' || response.role === 'ADMIN') {
            this.router.navigate(['/organisateur/dashboard']);
          } else if (response.role === 'PARTICIPANT') {
            this.router.navigate(['/participant/evenements']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Login failed', error);
          this.errorMessage = 'Invalid email or password';
        }
      });
    }
  }
}


