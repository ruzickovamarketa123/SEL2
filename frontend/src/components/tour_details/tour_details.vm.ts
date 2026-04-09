import { EventEmitter, Injectable, signal } from '@angular/core';
import { Tour } from './tour_details.model';

@Injectable()
export class TourDetailsViewModel {
    tour = signal<Tour | null>(null); // plain property → signal
    activeTab = signal<'details' | 'logs'>('details');
    isEditing = signal(false);
    editTourData = signal<Tour | null>(null);

    close = new EventEmitter<void>();
    edit = new EventEmitter<Tour>();
    delete = new EventEmitter<number>();

    onClose() {
        this.close.emit();
    }

    onEdit() {
        const currentTour = this.tour();
        if (currentTour) {
            // creating a copy to not to modify the original before saving
            this.editTourData.set({ ...currentTour });
            this.isEditing.set(true);
        }
    }

    cancelEdit() {
        this.isEditing.set(false);
        this.editTourData.set(null);
    }

    saveEdit() {
        const updated = this.editTourData();
        if (updated) {
            this.edit.emit(updated); // Send data to parent
            this.isEditing.set(false);
            this.editTourData.set(null);
        }
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

    //must be implemented
    getPopularityStars(): string {
        const rating = 4;
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    //must be implemented
    getChildFriendlyStars(): string {
        const rating = 3;
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }

}