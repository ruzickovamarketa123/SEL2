import {
  Component, AfterViewInit, OnDestroy, input, effect, ElementRef,
  ChangeDetectorRef, ChangeDetectionStrategy, inject
} from '@angular/core';
import * as L from 'leaflet';
import { Tour } from '../tour_details/tour_details.model';
import { MapViewModel } from './map-component.vm';

//default coordinates and zoom level when no tour is selected.
const EUROPE_CENTER: [number, number] = [54, 15];
const EUROPE_ZOOM = 4;

@Component({
  selector: 'app-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, //re.check this component only when its inputs change or when I explicitly call markForCheck()
  providers: [MapViewModel],
  templateUrl: './map-component.html',
  styles: [`:host { display: block; width: 100%; height: 100%; }`]
})
export class MapComponent implements AfterViewInit, OnDestroy {

  //istance of the view model
  private vm = inject(MapViewModel);

  tour = input<Tour | null>(null);

  private map!: L.Map;
  private mapReady = false;
  private routeLayer: L.GeoJSON | null = null;
  private markersLayer: L.LayerGroup | null = null;

  //nmessages shown if something  goes wrong
  routeError: string | null = null;
  routeNote: string | null = null;

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {
    // Angular automatically re-runs this block whenever any signal read inside it changes. 
    //this fires every time the parent component selects a different tour
    effect(() => {
      const currentTour = this.tour();

      //on the very first run, the Leaflet map instance does not exist yet
      if (!this.mapReady) return;

      // Remove whatever was drawn for the previously selected tour before drawing the new one.
      this.clearRoute();
      if (currentTour) {
        // A tour is selected: draw its markers and route on the map.
        this.renderTour(currentTour);
      } else {
        // no tour selected: reset the view back to the default overview
        this.map.setView(EUROPE_CENTER, EUROPE_ZOOM);
      }
    });
  }

  // called exactly once, right after this component's HTML has actually been rendered into the DOM.
  // The Leaflet map can only be created here, because it needs an existing
  // <div> element in the page to attach itself to.
  ngAfterViewInit(): void {
    //Small delay before creating the map
    // the container element can technically exist in the DOM but not yet have its final size
    setTimeout(() => {
      // Get the actual HTML element for the map,
      const container = this.el.nativeElement.querySelector('.map-container');

      //Create the Leaflet map instance inside that element
      this.map = L.map(container, { zoomControl: true })
        .setView(EUROPE_CENTER, EUROPE_ZOOM);

      // Add the base map imagery ("tiles"): the visual background with
      // roads, borders and place names, is fetched as image tiles from
      // CartoDB over HTTP as the user pans/zooms
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> © <a href="https://carto.com">CARTO</a>',
        maxZoom: 19,
      }).addTo(this.map);

      // Force Leaflet to recompute its container size, 
      // in case it was created while the surrounding layout was not fully settled yet
      this.map.invalidateSize();
       // From this point on, the effect() above is allowed to actually draw tours
      this.mapReady = true;

      // If a tour was already selected at the moment the map became ready 
      // (e.g. the page was reloaded with a tour already open),
      // draw it immediately instead of leaving the map empty.
      const currentTour = this.tour();
      if (currentTour) {
        this.renderTour(currentTour);
      }
    }, 100);
  }

  //removes whatever was drawn for the previously shown
  // tour before a new one is rendered
  private clearRoute(): void {
    this.routeError = null;
    this.routeNote = null;
    if (this.routeLayer)   { this.routeLayer.remove();   this.routeLayer = null; }
    if (this.markersLayer) { this.markersLayer.remove(); this.markersLayer = null; }
  }

  // Draws the given tour on the map
  private renderTour(tour: Tour): void {
    const fromCoords = this.vm.parseCoords(tour.from);
    const toCoords   = this.vm.parseCoords(tour.to);

    if (!fromCoords || !toCoords) {
      this.routeError = 'Invalid coordinates for this tour.';
      // Because this component uses OnPush change detection, Angular
      // will not automatically notice that routeError changed unless we
      // tell it to re-check the view explicitly
      this.cdr.markForCheck();
      return;
    }

    // A LayerGroup lets us treat both markers as a single unit, so they
    // can be removed together later with one call in clearRoute().
    this.markersLayer = L.layerGroup().addTo(this.map);

    const startIcon = L.divIcon({
      html: `<div style="background:#4da3ff;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });
    const endIcon = L.divIcon({
      html: `<div style="background:#ec56a4;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });

    // Place the markers, with a popup showing the place name, coordinates otherwise.
    L.marker(fromCoords, { icon: startIcon })
      .bindPopup(`<b>Start</b><br>${tour.fromName || tour.from}`)
      .addTo(this.markersLayer);
    L.marker(toCoords, { icon: endIcon })
      .bindPopup(`<b>End</b><br>${tour.toName || tour.to}`)
      .addTo(this.markersLayer);

    //fit the view so both markers are visible,
    this.map.fitBounds(L.latLngBounds([fromCoords, toCoords]), { padding: [60, 60] });

    // Parse the GeoJSON route geometry saved by the backend
    // (Tour.routeInformation), if present.
    const geometry = this.vm.parseRouteGeometry(tour);

    if (geometry) {
      // L.geoJSON understands the GeoJSON format and draws the route line
      this.routeLayer = L.geoJSON(geometry, {
        style: { color: '#4da3ff', weight: 4, opacity: 0.85 }
      }).addTo(this.map);
      // fit exactly to the route's bounds
      this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });
    } else {
      // if OpenRouteService failed when the tour
      // was created (no routeInformation saved), we still show the two
      // markers and simply inform the user that the route line is missing,
      // instead of breaking the map.
      this.routeNote = 'Route line unavailable for this tour. Showing markers only.';
    }
    // Required because of OnPush: tell Angular to re-check this
    // component's view now that routeError/routeNote may have changed.
    this.cdr.markForCheck();
  }

  // called automatically when this component is removed from the page
  //(e.g. user navigates away, component is recreated)
  // Ddestroys the Leaflet instance to avoid memory leaks
  ngOnDestroy(): void {
    this.map?.remove();
  }
}