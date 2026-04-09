import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.html',
})
export class SearchInput {
  searchTerm = signal('');

  @Output() searchChanged = new EventEmitter<string>();

  onSearch() {
    this.searchChanged.emit(this.searchTerm());
  }
}