import { Component, EventEmitter, Output, signal } from '@angular/core'; // Aggiungi signal
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Tour } from '../tour_details/tour_details.model';

@Component({
  selector: 'search-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-input.html',
})
export class SearchInput {
  searchTerm = signal('');
  showModal = signal(false);
  
  newTour = signal({ name: '', description: '', from: '', to: '', transportType: null});

  @Output() searchChanged = new EventEmitter<string>();
  @Output() tourAdded = new EventEmitter<Tour>();

  onSearch() {
    this.searchChanged.emit(this.searchTerm());
  }

  addTour() {
    this.tourAdded.emit({ ...this.newTour(), id: Date.now() });
    
    this.newTour.set({ name: '', description: '', from: '', to: '', transportType: null});
    this.showModal.set(false);
  }
}