import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   private apiUrl = 'http://localhost:8081/api/auth';
   
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }, this.httpOptions)
      .pipe(
        tap((response: any) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userRole', response.role);
        })
      );
}


 signup(userData: any): Observable<any> {
    console.log('Attempting signup with URL:', `${this.apiUrl}/signup`);
    console.log('Signup data:', userData);
    return this.http.post(`${this.apiUrl}/signup`, userData, this.httpOptions);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
