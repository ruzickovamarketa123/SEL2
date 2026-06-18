import { EventEmitter, Injectable, signal } from '@angular/core';
import { Tour } from './tour_details.model';

@Injectable()
export class TourDetailsViewModel {

  tour         = signal<Tour | null>(null);
  isEditing    = signal(false);
  editTourData = signal<Tour | null>(null);

  edit   = new EventEmitter<Tour>();
  delete = new EventEmitter<string>();

  onEdit() {
    const currentTour = this.tour();
    if (currentTour) {
      // Pre-populate from/to with the human-readable name so that even if
      // the user doesn't touch the field, the backend receives a city name
      // (not raw coordinates) and can geocode correctly.
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
      this.edit.emit(updated);
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
}
