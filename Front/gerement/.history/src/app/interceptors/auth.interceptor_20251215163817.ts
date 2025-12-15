// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authHeaders = authService.getAuthHeaders();
  
  // Si pas de headers d'auth, passer à la suite
  if (Object.keys(authHeaders).length === 0) {
    return next(req);
  }
  
  // Convertir HttpHeaders en objet simple
  const headersObject: { [key: string]: string } = {};
  authHeaders.keys().forEach(key => {
    const value = authHeaders.get(key);
    if (value) {
      headersObject[key] = value;
    }
  });
  
  // Cloner la requête avec les headers
  const authReq = req.clone({
    setHeaders: headersObject
  });
  
  return next(authReq);
};