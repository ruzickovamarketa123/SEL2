export interface Tour {
    id: number;
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

export interface TourLog {
    dateTime: Date;
    comment: string;
    difficulty: number; // 1-5
    totalDistance: number;
    totalTime: number; //minutes
    rating: number;
}

export type TransportType = 'Hike' | 'Bike' | 'Running' | 'Vacation' | null;