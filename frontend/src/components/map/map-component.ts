import { Component, Input, OnChanges, AfterViewInit, OnDestroy, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = iconDefault;

const TOUR_COORDS: Record<number, [number, number]> = {
  1: [48.8566, 2.3522],    // Paris, France
  2: [35.6762, 139.6503],  // Tokyo, Japan
  3: [40.7128, -74.006],   // New York, USA
  4: [41.9028, 12.4964],   // Rome, Italy
  5: [-1.2921, 36.8219],   // Nairobi, Kenya
};

const EUROPE_CENTER: [number, number] = [54, 15];
const EUROPE_ZOOM = 4;
const TOUR_ZOOM = 12;

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div id="tour-map" style="width: 100%; height: 100%; border-radius: 16px 16px 0 0;"></div>`,
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() selectedTour: any = null;

  private map!: L.Map;
  private marker: L.Marker | null = null;
  private initialized = false;

  ngAfterViewInit(): void {
    this.map = L.map('tour-map', { zoomControl: true }).setView(EUROPE_CENTER, EUROPE_ZOOM);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.initialized = true;

    if (this.selectedTour) {
      this.updateMap(this.selectedTour);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.initialized) return;

    const tour = changes['selectedTour']?.currentValue;
    if (tour) {
      this.updateMap(tour);
    } else {
      this.clearMarker();
      this.map.flyTo(EUROPE_CENTER, EUROPE_ZOOM, { duration: 1.2 });
    }
  }

  private updateMap(tour: any): void {
    const coords = TOUR_COORDS[tour.id];
    if (!coords) return;

    this.clearMarker();

    this.marker = L.marker(coords)
      .addTo(this.map)
      .bindPopup(
        `<b>${tour.name}</b><br>${tour.distance} · ${tour.estimatedTime} · ${tour.transportType}<br>`,
        { closeButton: false }
      )
      .openPopup();

    this.map.flyTo(coords, TOUR_ZOOM, { duration: 1.4 });
  }

  private clearMarker(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = null;
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}