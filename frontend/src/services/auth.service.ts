import { Injectable, signal, computed } from '@angular/core';
import { LoginRequest, LoginResponse } from '../components/auth/login/login.model';
import { RegisterRequest } from '../components/auth/register/register.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private token = signal<string | null>(localStorage.getItem('token'));

  isLoggedIn = computed(() => this.token() !== null);

  async login(username: string, password: string) {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    localStorage.setItem('token', data.token);
    this.token.set(data.token);
  }

  async register(data: { username: string; email: string; password: string }) {
    const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    localStorage.setItem('token', result.token);
    this.token.set(result.token);
}

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
  }

  getToken() {
    return this.token();
  }
}
