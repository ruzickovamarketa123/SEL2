import {
  Component, AfterViewInit, OnDestroy, input, effect, ElementRef,
  ChangeDetectorRef, ChangeDetectionStrategy
} from '@angular/core';
import * as L from 'leaflet';
import { Tour } from '../tour_details/tour_details.model';

const EUROPE_CENTER: [number, number] = [54, 15];
const EUROPE_ZOOM = 4;

const ORS_PROFILE: Record<string, string> = {
  Bike:     'cycling-regular',
  Hike:     'foot-walking',
  Running:  'foot-walking',
  Vacation: 'driving-car',
};

@Component({
  selector: 'app-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="position: relative; width: 100%; height: 100%;">
      <div class="map-container" style="width: 100%; height: 100%;"></div>

      @if (isLoading) {
        <div style="
          position: absolute; inset: 0;
          background: rgba(255,255,255,0.65);
          display: flex; align-items: center; justify-content: center;
          border-radius: 16px; z-index: 1000;
          font-size: 20px; color: #555;
        ">
          loading route...
        </div>
      }

      @if (routeError) {
        <div style="
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          background: rgba(255, 88, 88, 0.9); color: white;
          padding: 8px 16px; border-radius: 8px; font-size: 13px; z-index: 1000;
        ">
          {{ routeError }}
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class MapComponent implements AfterViewInit, OnDestroy {

  // Signal inputs — Angular tracks these reactively, unlike @Input()
  tour   = input<Tour | null>(null);
  apiKey = input<string>('');

  private map!: L.Map;
  private mapReady = false;
  private routeLayer: L.GeoJSON | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private currentRenderToken = 0;

  isLoading = false;
  routeError: string | null = null;

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {
    // effect() runs whenever tour() or apiKey() signal changes —
    // this is the reliable reactive alternative to ngOnChanges
    effect(() => {
      const currentTour = this.tour();
      // If the map isn't ready yet, ngAfterViewInit will call renderTour()
      if (!this.mapReady) return;

      this.clearRoute();
      if (currentTour) {
        this.renderTour(currentTour);
      } else {
        this.map.setView(EUROPE_CENTER, EUROPE_ZOOM);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const container = this.el.nativeElement.querySelector('.map-container');
      this.map = L.map(container, { zoomControl: true })
        .setView(EUROPE_CENTER, EUROPE_ZOOM);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
        maxZoom: 19,
      }).addTo(this.map);

      this.map.invalidateSize();
      this.mapReady = true;

      // Render the tour that was already set before the map was ready
      const currentTour = this.tour();
      if (currentTour) {
        this.renderTour(currentTour);
      }
    }, 100);
  }

  private parseCoords(raw: string): [number, number] | null {
    const parts = raw.trim().split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[1], parts[0]]; // Leaflet wants [lat, lon]
    }
    return null;
  }

  private clearRoute(): void {
    this.currentRenderToken++;
    this.isLoading = false;
    this.routeError = null;
    if (this.routeLayer)   { this.routeLayer.remove();   this.routeLayer = null; }
    if (this.markersLayer) { this.markersLayer.remove(); this.markersLayer = null; }
  }

  private async renderTour(tour: Tour): Promise<void> {
    const token = ++this.currentRenderToken;

    const fromCoords = this.parseCoords(tour.from);
    const toCoords   = this.parseCoords(tour.to);

    if (!fromCoords || !toCoords) {
      this.routeError = 'Invalid coordinates for this tour.';
      this.cdr.markForCheck();
      return;
    }

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
      .bindPopup(`<b>Start</b><br>${tour.fromName || tour.from}`)
      .addTo(this.markersLayer);
    L.marker(toCoords, { icon: endIcon })
      .bindPopup(`<b>End</b><br>${tour.toName || tour.to}`)
      .addTo(this.markersLayer);

    this.map.fitBounds(L.latLngBounds([fromCoords, toCoords]), { padding: [60, 60] });

    // Set loading BEFORE the await and notify Angular immediately
    this.isLoading = true;
    this.routeError = null;
    this.cdr.markForCheck();

    try {
      const profile = ORS_PROFILE[tour.transportType ?? ''] ?? 'driving-car';
      const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${this.apiKey()}&start=${tour.from}&end=${tour.to}`;

      const res = await fetch(url);
      if (token !== this.currentRenderToken) return;
      if (!res.ok) throw new Error(`ORS error: ${res.status}`);

      const data = await res.json();
      const geometry = data?.features?.[0]?.geometry;
      if (!geometry) throw new Error('No route geometry in response');
      if (token !== this.currentRenderToken) return;

      this.routeLayer = L.geoJSON(geometry, {
        style: { color: '#4da3ff', weight: 4, opacity: 0.85 }
      }).addTo(this.map);

      this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });

    } catch (err: any) {
      if (token !== this.currentRenderToken) return;
      console.error('Map route error:', err);
      this.routeError = 'Could not load route. Showing markers only.';
    } finally {
      if (token === this.currentRenderToken) {
        this.isLoading = false;
        // Notify Angular that isLoading/routeError changed after the async fetch
        this.cdr.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}
