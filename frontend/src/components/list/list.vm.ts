import { Injectable, signal, computed } from '@angular/core';
import { Tour } from '../tour_details/tour_details.model';

@Injectable()
export class ListViewModel {
  
  searchTerm = signal('');
  selectedId = signal<number | null>(null);
  showAddModal = signal(false);
  errorMessage = signal<string | null>(null);

  // Initially empty, it will be populated by the Input() of list.ts
  allToursData = signal<Tour[]>([]);

  //observer 1: reacts to changes in searchTerm and allToursData
  filteredTours = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.allToursData().filter(t => t.name.toLowerCase().includes(term));
  });

  //observer 2: Reacts to filteredTours (and indirectly to searchTerm)
  resultsCount = computed(() => this.filteredTours().length);

  //Observer 3: Reacts to both searchTerm and resultsCount
  searchStatusMessage = computed(() => {
    if (this.searchTerm() === '') return 'Showing all tours';
    return `Found ${this.resultsCount()} tours for "${this.searchTerm()}"`;
  });

  //temporary state
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
    return name.trim().length > 0 && from.trim().length > 0 && to.trim().length > 0 && transportType !== null;
  }

  resetForm() {
    this.newTour.set({ name: '', description: '', from: '', to: '', transportType: null as any });
  }
}