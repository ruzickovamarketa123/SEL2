import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

const EUROPE_CENTER: [number, number] = [54, 15];
const EUROPE_ZOOM = 4;

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div id="tour-map" style="width: 100%; height: 100%;"></div>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;

  ngAfterViewInit(): void {
    // Delay ensures the container has correct dimensions before Leaflet initializes
    setTimeout(() => {
      this.map = L.map('tour-map', { zoomControl: true }).setView(EUROPE_CENTER, EUROPE_ZOOM);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
        maxZoom: 19,
      }).addTo(this.map);

      // Force Leaflet to recalculate container size
      this.map.invalidateSize();
    }, 100);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}