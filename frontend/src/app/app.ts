import { Component } from '@angular/core';
import { SearchInput } from './search-input/search-input';
import { List } from './list/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchInput, List],
  templateUrl: './app.html',
})
export class App {
  currentSearch = '';
  tours: any[] = [];

  onTourAdded(tour: any) {
    this.tours = [...this.tours, tour];
  }
}