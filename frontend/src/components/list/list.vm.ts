import { Injectable, signal, computed } from '@angular/core';
import { Tour } from '../tour_details/tour_details.model';

@Injectable()
export class ListViewModel {

  searchTerm   = signal('');
  selectedId   = signal<string | null>(null);
  showAddModal = signal(false);
  errorMessage = signal<string | null>(null);

  allToursData = signal<Tour[]>([]);

  // Tours are already filtered by the backend — this computed just
  // exposes the full list so the template can iterate over it.
  filteredTours = computed(() => this.allToursData());

  newTour = signal({
    name: '', description: '', from: '', to: '', transportType: null
  });

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
    return (
      name.trim().length > 0 &&
      from.trim().length > 0 &&
      to.trim().length > 0 &&
      transportType !== null
    );
  }

  resetForm() {
    this.newTour.set({ name: '', description: '', from: '', to: '', transportType: null as any });
  }
}
