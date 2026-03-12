import { EventEmitter, Injectable, signal } from '@angular/core';
import { Tour } from './tour_details.model';

@Injectable()
export class TourDetailsViewModel {
    tour = signal<Tour | null>(null); // plain property → signal
    close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}