import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private token = signal<string | null>(localStorage.getItem('token'));
  private username = signal<string | null>(localStorage.getItem('username'));

  isLoggedIn = computed(() => this.token() !== null);

  async login(data: { username: string; password: string }) {
    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Login failed');
    const result = await res.json();
    localStorage.setItem('token', result.token);
    localStorage.setItem('username', result.username);
    this.token.set(result.token);
    this.username.set(result.username);
  }

  async register(data: { username: string; email: string; password: string }) {
    const res = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Registration failed');
    const result = await res.json();
    localStorage.setItem('token', result.token);
    localStorage.setItem('username', result.username);
    this.token.set(result.token);
    this.username.set(result.username);
  }

  async updateProfile(data: { username: string; email: string; password: string }) {
    const res = await fetch('http://localhost:8080/api/users/me', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token()}`
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Update failed');
}

updateUsername(newUsername: string) {
    localStorage.setItem('username', newUsername);
    this.username.set(newUsername);
}

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.token.set(null);
    this.username.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  getUsername(): string | null {
    return this.username();
  }
}