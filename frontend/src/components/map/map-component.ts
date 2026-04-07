import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';

const EUROPE_CENTER: [number, number] = [54, 15];
const EUROPE_ZOOM = 4;

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div id="tour-map" style="width: 100%; height: 100%; border-radius: 16px 16px 0 0;"></div>`,
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;

  ngAfterViewInit(): void {
    this.map = L.map('tour-map', { zoomControl: true }).setView(EUROPE_CENTER, EUROPE_ZOOM);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
      maxZoom: 19,
    }).addTo(this.map);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}