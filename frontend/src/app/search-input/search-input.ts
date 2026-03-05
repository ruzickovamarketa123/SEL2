import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'search-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-input.html',
})
export class SearchInput {
  searchTerm = '';
  showModal = false;

  newTour = { name: '', location: '', duration: '', price: 0 };

  @Output() searchChanged = new EventEmitter<string>();
  @Output() tourAdded = new EventEmitter<any>();

  onSearch() {
    this.searchChanged.emit(this.searchTerm);
  }

  addTour() {
    this.tourAdded.emit({ ...this.newTour, id: Date.now() });
    this.newTour = { name: '', location: '', duration: '', price: 0 };
    this.showModal = false;
  }
}