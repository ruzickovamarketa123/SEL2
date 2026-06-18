import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Tour } from '../components/tour_details/tour_details.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TourService {

  private readonly API_URL = 'http://localhost:8080/api/tours';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  async findAll(): Promise<Tour[]> {
    return firstValueFrom(
      this.http.get<Tour[]>(this.API_URL, { headers: this.getHeaders() })
    );
  }

  async create(tour: Tour): Promise<Tour> {
    return firstValueFrom(
      this.http.post<Tour>(this.API_URL, tour, { headers: this.getHeaders() })
    );
  }

  async update(tour: Tour): Promise<Tour> {
    return firstValueFrom(
      this.http.put<Tour>(`${this.API_URL}/${tour.id}`, tour, { headers: this.getHeaders() })
    );
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
    );
  }

  async search(term: string): Promise<Tour[]> {
    return firstValueFrom(
      this.http.get<Tour[]>(`${this.API_URL}/search`, {
        headers: this.getHeaders(),
        params: { q: term }
      })
    );
  }
}