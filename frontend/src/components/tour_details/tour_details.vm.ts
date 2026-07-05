import { Injectable, inject, signal } from '@angular/core';
import { Tour } from './tour_details.model';
import { Mediator } from '../../services/mediator.service';

@Injectable()
export class TourDetailsViewModel {
  private mediator = inject(Mediator);

  tour = this.mediator.selectedTour;
  isEditing = signal(false);
  editTourData = signal<Tour | null>(null);

  onEdit() {
    const currentTour = this.tour();
    if (currentTour) {
      this.editTourData.set({
        ...currentTour,
        from: currentTour.fromName || currentTour.from,
        to:   currentTour.toName   || currentTour.to,
      });
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
      this.mediator.editTour(updated);
      this.isEditing.set(false);
      this.editTourData.set(null);
    }
  }

  onDelete() {
    const currentTour = this.tour();
    if (currentTour && confirm(`Are you sure you want to delete "${currentTour.name}"?`)) {
      this.mediator.deleteTour(currentTour.id);
    }
  }
}