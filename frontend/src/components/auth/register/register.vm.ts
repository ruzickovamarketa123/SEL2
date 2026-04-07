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
    firstName: '',
    lastName: '',
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
    this.form.set({ firstName: '', lastName: '', email: '', password: '' });
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  updateFirstName(value: string): void { this.form.set({ ...this.form(), firstName: value }); }
  updateLastName(value: string): void { this.form.set({ ...this.form(), lastName: value }); }
  updateEmail(value: string): void { this.form.set({ ...this.form(), email: value }); }
  updatePassword(value: string): void { this.form.set({ ...this.form(), password: value }); }

  isFormValid(): boolean {
    const { firstName, lastName, email, password } = this.form();
    return firstName.trim().length > 0 && lastName.trim().length > 0 && email.trim().length > 0 && email.includes('@') && password.length >= 6;
  }

  async register(): Promise<void> {
    if (!this.isFormValid()) {
      this.errorMessage.set('Please fill in all fields. Password must be at least 6 characters.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.register(this.form());
      this.successMessage.set('Registration successful! You can now log in.');
      this.form.set({ firstName: '', lastName: '', email: '', password: '' });
    } catch (err: any) {
      this.errorMessage.set(err.message ?? 'Registration failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}