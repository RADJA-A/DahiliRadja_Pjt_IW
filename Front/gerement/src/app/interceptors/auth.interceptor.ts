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
  
  // Pas besoin de convertir, authHeaders est déjà un objet simple
  const authReq = req.clone({
    setHeaders: authHeaders
  });
  
  return next(authReq);
};