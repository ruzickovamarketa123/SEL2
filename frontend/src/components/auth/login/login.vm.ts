import { Injectable, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from './login.model';

@Injectable()
export class LoginViewModel {
  readonly isVisible = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = signal<LoginRequest>({ username: '', password: '' });

  constructor(private authService: AuthService) {}

  open(): void {
    this.errorMessage.set(null);
    this.isVisible.set(true);
  }

  close(): void {
    this.isVisible.set(false);
    this.form.set({ username: '', password: '' });
    this.errorMessage.set(null);
  }

  updateUsername(username: string): void {
    this.form.set({ ...this.form(), username });
  }

  updatePassword(password: string): void {
    this.form.set({ ...this.form(), password });
  }

  isFormValid(): boolean {
    const { username, password } = this.form();
    return username.trim().length > 0 && password.length > 0;
  }

  // calls authservice - future SpringBoot integration at localhost:8080/api
  async login(): Promise<void> {
    if (!this.isFormValid()) {
      this.errorMessage.set('please fill in all fields.');
      return;
    }
    await this.authService.login(this.form());
    this.close();
  }
}