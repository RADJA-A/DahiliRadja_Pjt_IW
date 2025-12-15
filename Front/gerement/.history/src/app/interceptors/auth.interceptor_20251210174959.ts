import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Cloner la requête pour ajouter les headers
    const authReq = this.addAuthHeaders(req);
    
    return next.handle(authReq);
  }

  private addAuthHeaders(req: HttpRequest<any>): HttpRequest<any> {
    // Récupérer les headers d'authentification
    const authHeaders = this.authService.getAuthHeaders();
    
    // Si pas de headers d'auth, retourner la requête originale
    if (Object.keys(authHeaders).length === 0) {
      return req;
    }
    
    // Cloner avec les nouveaux headers
    return req.clone({
      setHeaders: authHeaders
    });
  }
}