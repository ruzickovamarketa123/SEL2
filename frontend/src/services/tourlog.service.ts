import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TourLog } from '../components/tourlog_details/tourlog.model';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class TourLogService {

  private readonly API_URL = `${environment.backendUrl}/api/tours`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  async findAll(): Promise<TourLog[]> {
    return firstValueFrom(
      this.http.get<TourLog[]>(this.API_URL, { headers: this.getHeaders() })
    );
  }

  async create(tourLog: TourLog): Promise<TourLog> {
    return firstValueFrom(
      this.http.post<TourLog>(this.API_URL, tourLog, { headers: this.getHeaders() })
    );
  }

  async update(tourLog: TourLog): Promise<TourLog> {
    return firstValueFrom(
      this.http.put<TourLog>(`${this.API_URL}/${tourLog.id}`, tourLog, { headers: this.getHeaders() })
    );
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
    );
  }
}