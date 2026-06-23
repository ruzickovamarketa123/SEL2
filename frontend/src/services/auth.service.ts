import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.backendUrl}/api/auth`;
  private readonly USERS_URL = `${environment.backendUrl}/api/users`;

  private token    = signal<string | null>(localStorage.getItem('token'));
  private username = signal<string | null>(localStorage.getItem('username'));

  isLoggedIn = computed(() => this.token() !== null);

  async login(data: { username: string; password: string }): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<{ token: string; username: string }>(
        `${this.API_URL}/login`, data
      )
    );
    this.saveSession(result.token, result.username);
  }

  async register(data: { username: string; email: string; password: string }): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<{ token: string; username: string }>(
        `${this.API_URL}/register`, data
      )
    );
    this.saveSession(result.token, result.username);
  }

  async updateProfile(data: { username: string; email: string; password: string }): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.USERS_URL}/me`, data, {
        headers: { Authorization: `Bearer ${this.token()}` }
      })
    );
  }

  updateUsername(newUsername: string): void {
    localStorage.setItem('username', newUsername);
    this.username.set(newUsername);
  }

  logout(): void {
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

  private saveSession(token: string, username: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    this.token.set(token);
    this.username.set(username);
  }
}
