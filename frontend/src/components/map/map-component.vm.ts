import { Injectable } from '@angular/core';
import { Tour } from '../tour_details/tour_details.model';

@Injectable()
export class MapViewModel {

  parseCoords(raw: string): [number, number] | null {
    const parts = raw.trim().split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[1], parts[0]];
    }
    return null;
  }

  parseRouteGeometry(tour: Tour): any | null {
    if (!tour.routeInformation) return null;
    try {
      return JSON.parse(tour.routeInformation as unknown as string);
    } catch {
      return null;
    }
  }
}