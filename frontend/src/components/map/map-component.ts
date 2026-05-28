import {
  Component, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges
} from '@angular/core';
import * as L from 'leaflet';
import { Tour } from '../tour_details/tour_details.model';

const EUROPE_CENTER: [number, number] = [54, 15];
const EUROPE_ZOOM = 4;

// ORS profile mapping (mirrors backend logic)
const ORS_PROFILE: Record<string, string> = {
  Bike:     'cycling-regular',
  Hike:     'foot-walking',
  Running:  'foot-walking',
  Vacation: 'driving-car',
};

@Component({
  selector: 'app-map',
  standalone: true,
  template: `
    <div style="position: relative; width: 100%; height: 100%;">
      <div id="tour-map" style="width: 100%; height: 100%;"></div>

      <!-- Loading overlay -->
      @if (isLoading) {
        <div style="
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.65);
          display: flex; align-items: center; justify-content: center;
          border-radius: 16px; z-index: 1000;
          font-size: 14px; color: #555; gap: 8px;
        ">
          <span style="font-size: 20px;">🗺️</span> loading route...
        </div>
      }

      <!-- Error message -->
      @if (routeError) {
        <div style="
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          background: rgba(255, 88, 88, 0.9); color: white;
          padding: 8px 16px; border-radius: 8px; font-size: 13px; z-index: 1000;
        ">
          ⚠️ {{ routeError }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {

  @Input() tour: Tour | null = null;
  @Input() apiKey: string = '';

  private map!: L.Map;
  private routeLayer: L.GeoJSON | null = null;
  private markersLayer: L.LayerGroup | null = null;

  isLoading = false;
  routeError: string | null = null;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.map = L.map('tour-map', { zoomControl: true })
        .setView(EUROPE_CENTER, EUROPE_ZOOM);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
        maxZoom: 19,
      }).addTo(this.map);

      this.map.invalidateSize();

      // If a tour was set before the map was ready, render it now
      if (this.tour) {
        this.renderTour(this.tour);
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tour'] && this.map) {
      const tour = changes['tour'].currentValue as Tour | null;
      this.clearRoute();
      if (tour) {
        this.renderTour(tour);
      } else {
        this.map.setView(EUROPE_CENTER, EUROPE_ZOOM);
      }
    }
  }

  // Parses "lon,lat" string into [lat, lon] for Leaflet
  private parseCoords(raw: string): [number, number] | null {
    const parts = raw.trim().split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[1], parts[0]]; // Leaflet wants [lat, lon]
    }
    return null;
  }

  private clearRoute(): void {
    this.routeError = null;
    if (this.routeLayer) { this.routeLayer.remove(); this.routeLayer = null; }
    if (this.markersLayer) { this.markersLayer.remove(); this.markersLayer = null; }
  }

  private async renderTour(tour: Tour): Promise<void> {
    const fromCoords = this.parseCoords(tour.from);
    const toCoords   = this.parseCoords(tour.to);

    if (!fromCoords || !toCoords) {
      this.routeError = 'Invalid coordinates for this tour.';
      return;
    }

    // Place start/end markers immediately
    this.markersLayer = L.layerGroup().addTo(this.map);

    const startIcon = L.divIcon({
      html: `<div style="background:#4da3ff;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });
    const endIcon = L.divIcon({
      html: `<div style="background:#ec56a4;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });

    L.marker(fromCoords, { icon: startIcon })
      .bindPopup(`<b>Start</b><br>${tour.from}`)
      .addTo(this.markersLayer);
    L.marker(toCoords, { icon: endIcon })
      .bindPopup(`<b>End</b><br>${tour.to}`)
      .addTo(this.markersLayer);

    // Fit map to markers right away
    const bounds = L.latLngBounds([fromCoords, toCoords]);
    this.map.fitBounds(bounds, { padding: [60, 60] });

    // Fetch route from ORS
    this.isLoading = true;
    this.routeError = null;

    try {
      const profile = ORS_PROFILE[tour.transportType ?? ''] ?? 'driving-car';
      // ORS expects "lon,lat" — our stored format is already "lon,lat"
      const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${this.apiKey}&start=${tour.from}&end=${tour.to}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`ORS error: ${res.status}`);

      const data = await res.json();
      const geometry = data?.features?.[0]?.geometry;

      if (!geometry) throw new Error('No route geometry in response');

      // Draw the route polyline
      this.routeLayer = L.geoJSON(geometry, {
        style: {
          color: '#4da3ff',
          weight: 4,
          opacity: 0.85,
        }
      }).addTo(this.map);

      // Fit to full route bounds
      this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });

    } catch (err: any) {
      console.error('Map route error:', err);
      this.routeError = 'Could not load route. Showing markers only.';
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
