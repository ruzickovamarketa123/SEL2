import { Injectable, inject, signal } from '@angular/core';
import { Tour } from '../tour_details/tour_details.model';
import { Mediator } from '../../services/mediator.service';

@Injectable()
export class ListViewModel {
  private mediator = inject(Mediator);

  filteredTours = this.mediator.enrichedTours;
  selectedId    = this.mediator.selectedTourId;
  activeTab     = this.mediator.activeTab;

  showAddModal = signal(false);
  errorMessage = signal<string | null>(null);

  newTour = signal({
    name: '', description: '', from: '', to: '', transportType: null
  });

  select(tour: Tour) {
    this.mediator.selectTour(tour);
  }

  closeTour() {
    this.mediator.closeTour();
  }

  setActiveTab(tab: 'details' | 'logs') {
    this.mediator.activeTab.set(tab);
  }

  openAddModal() {
    this.newTour.set({ name: '', description: '', from: '', to: '', transportType: null });
    this.errorMessage.set(null);
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.errorMessage.set(null);
  }

  isFormValid(): boolean {
    const { name, from, to, transportType } = this.newTour();
    return name.trim().length > 0 && from.trim().length > 0 &&
           to.trim().length > 0 && transportType !== null;
  }

  addTour() {
    if (!this.isFormValid()) {
      this.errorMessage.set('please fill in all required fields.');
      return;
    }
    this.mediator.addTour(this.newTour() as Tour);
    this.closeAddModal();
  }
}