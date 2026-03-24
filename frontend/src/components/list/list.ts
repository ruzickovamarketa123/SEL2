import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tour } from '../tour_details/tour_details.model';
import { ListViewModel } from './list.vm';

@Component({
  selector: 'list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ListViewModel],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
})
export class List {
  readonly vm = inject(ListViewModel);

  // Transform the inputs into signals to trigger the computes in the VM
  @Input() set searchTerm(value: string) { this.vm.searchTerm.set(value); }
  @Input() set tours(value: Tour[]) { this.vm.toursFromInput.set(value); }

  @Output() tourSelected = new EventEmitter<Tour>();

  selectedId: number | null = null;

  showAddModal = signal(false);
  newTour = signal<{ name: string; description: string; from: string; to: string; transportType: any }>({
    name: '', description: '', from: '', to: '', transportType: null
  });

  allTours: Tour[] = [
    { id: 1, name: 'Paris City Tour', description: 'A beautiful tour of Paris.', from: 'Eiffel Tower', to: 'Louvre', transportType: 'Hike' },
    { id: 2, name: 'Tokyo Explorer', description: 'Explore the streets of Tokyo.', from: 'Shinjuku', to: 'Shibuya', transportType: 'Bike' },
    { id: 3, name: 'New York Highlights', description: 'Run through NYC landmarks.', from: 'Central Park', to: 'Times Square', transportType: 'Running' },
    { id: 4, name: 'Rome Historical Walk', description: 'Walk through ancient Rome.', from: 'Colosseum', to: 'Vatican', transportType: 'Hike' },
    { id: 5, name: 'Safari Adventure', description: 'Wildlife vacation in Kenya.', from: 'Nairobi', to: 'Maasai Mara', transportType: 'Vacation' },
  ];

  select(tour: Tour) {
    this.vm.selectTour(tour.id);
    this.tourSelected.emit(tour);
  }

  addTour() {
    const t = this.newTour();
    this.allTours = [...this.allTours, { ...t, id: Date.now() }];
    this.newTour.set({ name: '', description: '', from: '', to: '', transportType: null });
    this.showAddModal.set(false);
  }
  
  get filteredTours(): Tour[] {
    return [...this.allTours, ...this.tours].filter(t =>
      t.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}