import { Injectable } from '@angular/core';
import { Tour } from '../tour_details/tour_details.model';

const ORS_PROFILE: Record<string, string> = {
  Bike:     'cycling-regular',
  Hike:     'foot-walking',
  Running:  'foot-walking',
  Vacation: 'driving-car',
};

const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/';

@Injectable()
export class MapViewModel {

  parseCoords(raw: string): [number, number] | null {
    const parts = raw.trim().split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[1], parts[0]]; // Leaflet wants [lat, lon]
    }
    return null;
  }

  getOrsProfile(transportType: string | null | undefined): string {
    return ORS_PROFILE[transportType ?? ''] ?? 'driving-car';
  }

  async fetchRoute(tour: Tour, apiKey: string): Promise<any> {
    const profile = this.getOrsProfile(tour.transportType);
    const url = `${ORS_DIRECTIONS_URL}${profile}?api_key=${apiKey}&start=${tour.from}&end=${tour.to}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`ORS error: ${res.status}`);

    const data = await res.json();
    const geometry = data?.features?.[0]?.geometry;
    if (!geometry) throw new Error('No route geometry in response');
    return geometry;
  }
}