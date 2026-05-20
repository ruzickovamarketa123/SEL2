import { Injectable, signal } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { UpdateUserRequest } from './profile.model';

@Injectable()
export class ProfileViewModel {
  readonly isVisible = signal(false);
  readonly isLoading = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = signal<UpdateUserRequest>({ username: '', email: '', password: '' });

  constructor(private authService: AuthService) {}

  open(): void {
    console.log('open called');
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.form.set({ username: '', email: '', password: '' });
    this.isVisible.set(true);
}

  close(): void {
    this.isVisible.set(false);
  }

  updateUsername(value: string) { this.form.set({ ...this.form(), username: value }); }
  updateEmail(value: string) { this.form.set({ ...this.form(), email: value }); }
  updatePassword(value: string) { this.form.set({ ...this.form(), password: value }); }

  async save(): Promise<void> {
    const { username, email, password } = this.form();
    if (!username && !email && !password) {
      this.errorMessage.set('fill in at least one field to update.');
      return;
    }
    try {
      this.isLoading.set(true);
      await this.authService.updateProfile(this.form());
      if (username) this.authService.updateUsername(username);
      this.successMessage.set('profile updated successfully!');
    } catch (e) {
      this.errorMessage.set('update failed. username or email may already exist.');
    } finally {
      this.isLoading.set(false);
    }
  }

    getUsername(): string | null {
     return this.authService.getUsername();
    }
}