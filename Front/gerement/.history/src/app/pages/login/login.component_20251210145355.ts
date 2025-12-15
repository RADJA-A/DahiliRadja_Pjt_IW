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
      
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      
      // Clear any old data first
      localStorage.clear();
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('=== LOGIN RESPONSE ===');
          console.log('Full response:', response);
          console.log('Response type:', typeof response);
          console.log('Response keys:', Object.keys(response));
          
          this.isLoading = false;
          
          // Check if response has expected structure
          if (response) {
            // Try different possible field names for ID
            const userId = response.id || response.userId || response.user?.id || 0;
            const userEmail = response.email || response.user?.email || email;
            const userNom = response.nom || response.user?.nom || '';
            const userPrenom = response.prenom || response.user?.prenom || '';
            const userRole = response.role || response.user?.role || '';
            const token = response.token || response.accessToken || '';
            
            console.log('Extracted values:');
            console.log('ID:', userId);
            console.log('Email:', userEmail);
            console.log('Nom:', userNom);
            console.log('Prenom:', userPrenom);
            console.log('Role:', userRole);
            console.log('Token:', token);
            
            if (!token) {
              console.error('No token in response!');
              this.errorMessage = 'Invalid response from server: No token';
              return;
            }
            
            if (userId === 0) {
              console.warn('User ID is 0! Response might have different structure');
            }
            
            // Store user data in localStorage
            const userData = {
              id: userId,
              email: userEmail,
              nom: userNom,
              prenom: userPrenom,
              role: userRole
            };
            
            console.log('Storing user data:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);
            
            // Verify storage
            console.log('Verifying storage...');
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            console.log('Stored user:', storedUser);
            console.log('Stored token exists:', !!storedToken);
            
            // Redirect based on role
            console.log('Redirecting with role:', userRole);
            if (userRole === 'ORGANIZER' || userRole === 'ADMIN') {
              this.router.navigate(['/organisateur/dashboard']);
            } else if (userRole === 'PARTICIPANT') {
              this.router.navigate(['/participant/evenements']);
            } else {
              console.warn('Unknown role, redirecting to home');
              this.router.navigate(['/']);
            }
          } else {
            console.error('Empty response from server');
            this.errorMessage = 'Empty response from server';
          }
        },
        error: (error) => {
          console.error('=== LOGIN ERROR ===');
          console.error('Error object:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error response:', error.error);
          
          this.isLoading = false;
          
          if (error.status === 401 || error.status === 400) {
            this.errorMessage = error.error?.message || 'Invalid email or password';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check if backend is running on port 8081.';
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
        }
      });
    }
  }

  // Add a test login method
  testLogin() {
    console.log('=== TEST LOGIN ===');
    
    // Test with hardcoded credentials
    this.loginForm.setValue({
      email: 'test@organizer.com',
      password: 'password123'
    });
    
    this.onSubmit();
  }

  // Add a method to manually set user data for testing
  setTestUser() {
    console.log('Setting test user data...');
    
    const testUser = {
      id: 1,
      email: 'test@organizer.com',
      nom: 'Organizer',
      prenom: 'Test',
      role: 'ORGANIZER',
      token: 'test-jwt-token-123'
    };
    
    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('token', testUser.token);
    
    console.log('Test user set:', testUser);
    console.log('LocalStorage user:', localStorage.getItem('user'));
    
    this.router.navigate(['/organisateur/dashboard']);
  }
}