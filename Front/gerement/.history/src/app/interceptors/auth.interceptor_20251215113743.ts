// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const headers = this.authService.getAuthHeaders();
    
    if (Object.keys(headers).length > 0) {
      req = req.clone({
        setHeaders: headers
      });
    }
    
    return next.handle(req);
  }
}