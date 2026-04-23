import { Injectable } from '@angular/core';
import { TourLog } from '../components/tourlog_details/tourlog.model';

@Injectable({ providedIn: 'root' })
export class TourLogService {

  private readonly API_URL = 'http://localhost:8080/logs';

  async findAll(): Promise<TourLog[]> {
    const res = await fetch(this.API_URL);
    return res.json();
  }

  async create(tourLog: TourLog): Promise<TourLog> {
    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tourLog)
    });
    return res.json();
  }

  async update(tourLog: TourLog): Promise<TourLog> {
    const res = await fetch(`${this.API_URL}/${tourLog.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tourLog)
    });
    return res.json();
  }

  async delete(id: string): Promise<void> {
    await fetch(`${this.API_URL}/${id}`, { method: 'DELETE' });
  }
}