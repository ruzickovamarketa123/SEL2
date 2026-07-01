import {
  Component, AfterViewInit, OnDestroy, input, effect, ElementRef,
  ChangeDetectorRef, ChangeDetectionStrategy, inject
} from '@angular/core';
import * as L from 'leaflet';
import { Tour } from '../tour_details/tour_details.model';
import { MapViewModel } from './map-component.vm';

const EUROPE_CENTER: [number, number] = [54, 15];
const EUROPE_ZOOM = 4;

@Component({
  selector: 'app-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MapViewModel],
  templateUrl: './map-component.html',
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class MapComponent implements AfterViewInit, OnDestroy {

  private vm = inject(MapViewModel);

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
    effect(() => {
      const currentTour = this.tour();
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

      const currentTour = this.tour();
      if (currentTour) {
        this.renderTour(currentTour);
      }
    }, 100);
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

    const fromCoords = this.vm.parseCoords(tour.from);
    const toCoords   = this.vm.parseCoords(tour.to);

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

    this.isLoading = true;
    this.routeError = null;
    this.cdr.markForCheck();

    try {
      const geometry = await this.vm.fetchRoute(tour, this.apiKey());
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
        this.cdr.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}