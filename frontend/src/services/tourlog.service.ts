import { Injectable } from '@angular/core';
import { TourLog } from '../components/tourlog_details/tourlog.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TourLogService {

  private readonly API_URL = 'http://localhost:8080/logs';

  constructor(private authService: AuthService) {}

  private headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    };
  }

  async findAll(): Promise<TourLog[]> {
    const res = await fetch(this.API_URL, { headers: this.headers() });
    return res.json();
  }

  async create(tourLog: TourLog): Promise<TourLog> {
    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(tourLog)
    });
    return res.json();
  }

  async update(tourLog: TourLog): Promise<TourLog> {
    const res = await fetch(`${this.API_URL}/${tourLog.id}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(tourLog)
    });
    return res.json();
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
      headers: this.headers()
    });
  }
}