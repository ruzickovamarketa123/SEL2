import { Injectable, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from './login.model';

@Injectable()
export class LoginViewModel {
  readonly isVisible = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly form = signal<LoginRequest>({ email: '', password: '' });

  constructor(private authService: AuthService) {}

  open(): void {
    this.errorMessage.set(null);
    this.isVisible.set(true);
  }

  close(): void {
    this.isVisible.set(false);
    this.form.set({ email: '', password: '' });
    this.errorMessage.set(null);
  }

  updateEmail(email: string): void {
    this.form.set({ ...this.form(), email });
  }

  updatePassword(password: string): void {
    this.form.set({ ...this.form(), password });
  }

  isFormValid(): boolean {
    const { email, password } = this.form();
    return email.trim().length > 0 && email.includes('@') && password.length > 0;
  }

  // calls authservice - fuiture SpringBoot integration at lkocalhost:8080/api
  async login(): Promise<void> {
    if (!this.isFormValid()) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.login(this.form());
      this.close();
    } catch (err: any) {
      this.errorMessage.set(err.message ?? 'Login failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}