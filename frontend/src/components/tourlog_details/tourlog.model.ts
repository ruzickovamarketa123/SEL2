export interface TourLog {
    id: string;
    tourId: string;
    date: string;
    time: string;
    comment: string;
    difficulty: difficultyType;
    totalDistance: number;
    totalTime: number;
    rating: number;
}

export type difficultyType = 'Easy' | 'Medium' | 'Hard' | 'Expert' |null;