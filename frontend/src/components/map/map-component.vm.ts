import { Injectable } from '@angular/core';
import { Tour } from '../tour_details/tour_details.model';

@Injectable()
export class MapViewModel {

  // Converts a coordinate string coming from the backend (format: "lon,lat")
  // into the [lat, lon] tuple that Leaflet expects.
  // Returns null if the string is missing, malformed, or not numeric —
  // letting the caller (MapComponent.renderTour) show an error
  parseCoords(raw: string): [number, number] | null {
    const parts = raw.trim().split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[1], parts[0]];
    }
    return null;
  }

  // Extracts and parses the route geometry (GeoJSON) that the backend saved
  // in tour.routeInformation, so Leaflet's L.geoJSON() can draw it directly.
  parseRouteGeometry(tour: Tour): any | null {
    if (!tour.routeInformation) return null;
    try {
      // routeInformation is stored as a JSON string in the database
      // so it needs to be parsed back into a real object here.
      return JSON.parse(tour.routeInformation as unknown as string);
    } catch {
      return null;
    }
  }
}