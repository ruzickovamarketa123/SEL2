import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Tour } from '../components/tour_details/tour_details.model';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

//This is the ONLY file in the frontend allowed to make raw HTTP calls about tours 
@Injectable({ providedIn: 'root' })
export class TourService {

  private readonly API_URL = `${environment.backendUrl}/api/tours`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Builds the headers required on every authenticated request:
  // - Content-Type so the backend knows the body is JSON
  // - Authorization: Bearer <token>, read fresh from AuthService everysingle call, not cached
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // GET /api/tours
  async findAll(): Promise<Tour[]> {
    return firstValueFrom(
      this.http.get<Tour[]>(this.API_URL, { headers: this.getHeaders() })
    );
  }

  // POST /api/tours
  //The backend fills in from/to coordinates, distance, estimatedTime, routeInformation 
  // before responding, so the returned Tour is richer than the one sent in.
  async create(tour: Tour): Promise<Tour> {
    return firstValueFrom(
      this.http.post<Tour>(this.API_URL, tour, { headers: this.getHeaders() })
    );
  }

  // PUT /api/tours/{id}
  async update(tour: Tour): Promise<Tour> {
    return firstValueFrom(
      this.http.put<Tour>(`${this.API_URL}/${tour.id}`, tour, { headers: this.getHeaders() })
    );
  }

  // DELETE /api/tours/{id}.
  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
    );
  }

  // GET /api/tours/search?q=...&minPopularity=...&minChildFriendliness=...
  // Default parameter values (= 0): if the caller doesn't pass filters at
  // all, search everything with no minimum thresholds
  async search(term: string, minPopularity = 0, minChildFriendliness = 0): Promise<Tour[]> {
    return firstValueFrom(
      this.http.get<Tour[]>(`${this.API_URL}/search`, {
        headers: this.getHeaders(),
        params: {
          q: term,
          minPopularity: String(minPopularity),
          minChildFriendliness: String(minChildFriendliness)
        }
      })
    );
  }
}
