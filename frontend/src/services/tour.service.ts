import { Injectable } from '@angular/core';
import { Tour } from '../components/tour_details/tour_details.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TourService {

  private readonly API_URL = 'http://localhost:8080/tours';

  constructor(private authService: AuthService) {}

  private headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    };
  }

  async findAll(): Promise<Tour[]> {
    const res = await fetch(this.API_URL, { headers: this.headers() });
    return res.json();
  }

  async create(tour: Tour): Promise<Tour> {
    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(tour)
    });
    return res.json();
  }

  async update(tour: Tour): Promise<Tour> {
    const res = await fetch(`${this.API_URL}/${tour.id}`, {
      method: 'PUT',
      headers: this.headers(),
      body: JSON.stringify(tour)
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