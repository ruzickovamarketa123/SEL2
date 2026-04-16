import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchInputViewModel } from './search-input.vm';

@Component({
  selector: 'search-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-input.html',
  providers: [SearchInputViewModel]
})
export class SearchInput {
  public vm = inject(SearchInputViewModel);

  @Output() searchChanged = new EventEmitter<string>();

  onSearch() {
    //takes the current search term form the view model and emit it to the parent
    this.searchChanged.emit(this.vm.searchTerm());
  }
}