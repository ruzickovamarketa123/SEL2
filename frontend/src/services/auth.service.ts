import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse } from '../components/auth/login/login.model';
import { RegisterRequest } from '../components/auth/register/register.model';

// authentification service for future SpringBoot backend integration
// currently throws errors on failed requests so VMs can dfisplay feedback
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api';

  async login(request: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${this.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Invalid email or password.');
    }

    return res.json();
  }

  async register(request: RegisterRequest): Promise<void> {
    const res = await fetch(`${this.API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Registration failed.');
    }
  }
}