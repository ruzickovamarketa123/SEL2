import { Component, inject } from '@angular/core';
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

  onSearch() {
    this.vm.search(this.vm.searchTerm());
  }
}