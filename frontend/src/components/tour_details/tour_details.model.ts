import { TourLog } from "../tourlog_details/tourlog.model";

export interface Tour {
    id: string;
    name: string;
    description: string;
    from: string;
    to: string;
    transportType: TransportType;
    popularity?: number; //1-5
    childFriendliness ?: number; //1-5
    logs?: TourLog[];

    //REST API (OpenRouteService)
    distance?: number;        //km
    estimatedTime?: number;   //minutes

    //(Leaflet)
    routeInformation?: any;
}

export type TransportType = 'Hike' | 'Bike' | 'Running' | 'Vacation' | null;