import { Injectable, inject, signal } from '@angular/core';
import { Tour } from './tour_details.model';
import { Mediator } from '../../services/mediator.service';

@Injectable()
export class TourDetailsViewModel {
  private mediator = inject(Mediator);

  tour = this.mediator.selectedTour;
  isEditing = signal(false);
  editTourData = signal<Tour | null>(null);
  errorMessage = signal<string | null>(null);

  onEdit() {
    const currentTour = this.tour();
    if (currentTour) {
      this.editTourData.set({
        ...currentTour,
        from: currentTour.fromName || currentTour.from,
        to:   currentTour.toName   || currentTour.to,
      });
      this.errorMessage.set(null);
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editTourData.set(null);
    this.errorMessage.set(null);
  }

  isEditValid(): boolean {
    const t = this.editTourData();
    if (!t) return false;
    return t.name.trim().length > 0 && t.from.trim().length > 0 &&
           t.to.trim().length > 0 && t.transportType !== null;
  }

  async saveEdit() {
    const updated = this.editTourData();
    if (!updated || !this.isEditValid()) {
      this.errorMessage.set('please fill in all required fields.');
      return;
    }
    try {
      await this.mediator.editTour(updated);
      this.isEditing.set(false);
      this.editTourData.set(null);
      this.errorMessage.set(null);
    } catch (e) {
      this.errorMessage.set('could not save changes. please try again.');
    }
  }

  onDelete() {
    const currentTour = this.tour();
    if (currentTour && confirm(`Are you sure you want to delete "${currentTour.name}"?`)) {
      this.mediator.deleteTour(currentTour.id);
    }
  }
}