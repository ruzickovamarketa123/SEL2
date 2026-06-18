import { TourLog } from "../tourlog_details/tourlog.model";

export interface Tour {
    id: string;
    name: string;
    description: string;
    from: string;       // coordinates "lon,lat" — used by the map
    to: string;         // coordinates "lon,lat" — used by the map
    fromName?: string;  // human-readable label e.g. "Vienna"
    toName?: string;    // human-readable label e.g. "Roma"
    transportType: TransportType;
    popularity?: number;
    childFriendliness?: number;
    logs?: TourLog[];

    // REST API (OpenRouteService)
    distance?: number;      // km
    estimatedTime?: number; // minutes

    // (Leaflet)
    routeInformation?: any;
}

export type TransportType = 'Hike' | 'Bike' | 'Running' | 'Vacation' | null;
