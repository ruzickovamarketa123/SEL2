export interface TourLog {
    id: number;
    tourId: number; // link to the tour
    dateTime: string;
    comment: string;
    difficulty: difficultyType;
    totalDistance: number;  //km
    totalTime: number; //minutes
    rating: number;
}

export type difficultyType = 'Easy' | 'Medium' | 'Hard' | 'Expert' |null;