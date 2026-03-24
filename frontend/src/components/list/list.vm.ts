import { Injectable, signal, computed } from '@angular/core';
import { Tour } from '../tour_details/tour_details.model';

@Injectable()
export class ListViewModel {
  
  searchTerm = signal('');

  private allToursData = signal<Tour[]>([ 
    { id: 1, name: 'Paris City Tour', description: 'A beautiful tour of Paris.', from: 'Eiffel Tower', to: 'Louvre', transportType: 'Hike' },
    { id: 2, name: 'Tokyo Explorer', description: 'Explore the streets of Tokyo.', from: 'Shinjuku', to: 'Shibuya', transportType: 'Bike' },
    { id: 3, name: 'New York Highlights', description: 'Run through NYC landmarks.', from: 'Central Park', to: 'Times Square', transportType: 'Running' },
    { id: 4, name: 'Rome Historical Walk', description: 'Walk through ancient Rome.', from: 'Colosseum', to: 'Vatican', transportType: 'Hike' },
    { id: 5, name: 'Safari Adventure', description: 'Wildlife vacation in Kenya.', from: 'Nairobi', to: 'Maasai Mara', transportType: 'Vacation' },
  ]);

  filteredTours = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.allToursData().filter(t => t.name.toLowerCase().includes(term));
  });

  selectedId = signal<number | null>(null);

  selectTour(id: number) {
    this.selectedId.set(id);
  }

  showAddModal = signal(false);

  newTour = signal({
    name: '', description: '', from: '', to: '', transportType: null as any
  });

  openAddModal() {
    this.newTour.set({ name: '', description: '', from: '', to: '', transportType: null });
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addTour() {
    const t = this.newTour();
    this.allToursData.set([...this.allToursData(), { ...t, id: Date.now() }]);
    this.newTour.set({ name: '', description: '', from: '', to: '', transportType: null });
    this.showAddModal.set(false);
  }
}