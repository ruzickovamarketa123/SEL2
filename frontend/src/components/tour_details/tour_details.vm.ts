import { EventEmitter, Injectable, signal } from '@angular/core';
import { Tour } from './tour_details.model';

@Injectable()
export class TourDetailsViewModel {
    tour = signal<Tour | null>(null); // plain property → signal
    activeTab = signal<'details' | 'logs'>('details');

    close = new EventEmitter<void>();
    edit = new EventEmitter<Tour>();
    delete = new EventEmitter<number>();

    onClose() {
        this.close.emit();
    }

    onEdit() {
        const currentTour = this.tour();
        if (currentTour) this.edit.emit(currentTour);
    }

    onDelete() {
        const currentTour = this.tour();
        if (currentTour && confirm(`Are you sure you want to delete "${currentTour.name}"?`)) {
            this.delete.emit(currentTour.id);
        }
    }

    setTab(tab: 'details' | 'logs') {
        this.activeTab.set(tab);
    }

    getPopularityStars(tour: any): string {
        const rating = 4;
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    getChildFriendlyStars(tour: any): string {
        const rating = 3;
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

}