import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse } from '../components/auth/login/login.model';
import { RegisterRequest } from '../components/auth/register/register.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  async login(request: LoginRequest): Promise<void> {
    // TODO: SpringBoot integration
  }

  async register(request: RegisterRequest): Promise<void> {
    // TODO: SpringBoot integration
  }
}
