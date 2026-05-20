import { Injectable, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { RegisterRequest } from './register.model';

@Injectable()
export class RegisterViewModel {
  readonly isVisible = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = signal<RegisterRequest>({
  username: '',
  email: '',
  password: '',
});

  constructor(private authService: AuthService) {}

  open(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isVisible.set(true);
  }

  close(): void {
    this.isVisible.set(false);
    this.form.set({ username: '', email: '', password: '' });
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  updateUsername(value: string): void { this.form.set({ ...this.form(), username: value }); }
  updateEmail(value: string): void { this.form.set({ ...this.form(), email: value }); }
  updatePassword(value: string): void { this.form.set({ ...this.form(), password: value }); }

  isFormValid(): boolean {
    const { username, email, password } = this.form();
    return username.trim().length > 0 && email.trim().length > 0 && email.includes('@') && password.length >= 6;
  }

  // calls authservice - fuiture SpringBoot integration at lkocalhost:8080/api
  async register(): Promise<void> {
    if (!this.isFormValid()) {
        this.errorMessage.set('please fill in all fields. password must be at least 6 characters.');
        return;
    }
    try {
        await this.authService.register(this.form());
        this.successMessage.set('registration successful! you can now log in.');
        this.form.set({ username: '', email: '', password: '' });
    } catch (e) {
        this.errorMessage.set('registration failed. username or email may already exist.');
    }
}
}