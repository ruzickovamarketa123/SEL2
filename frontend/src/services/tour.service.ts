import { Injectable } from '@angular/core';
import { Tour } from '../components/tour_details/tour_details.model';

@Injectable({ providedIn: 'root' })
export class TourService {

  private readonly API_URL = 'http://localhost:8080/tours';

  async findAll(): Promise<Tour[]> {
    const res = await fetch(this.API_URL);
    return res.json();
  }

  async create(tour: Tour): Promise<Tour> {
    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tour)
    });
    return res.json();
  }

  async update(tour: Tour): Promise<Tour> {
    const res = await fetch(`${this.API_URL}/${tour.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tour)
    });
    return res.json();
  }

  async delete(id: number): Promise<void> {
    await fetch(`${this.API_URL}/${id}`, { method: 'DELETE' });
  }
}