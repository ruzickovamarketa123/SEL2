import { Component } from '@angular/core';
import { SearchInput } from './search-input/search-input';
import { List } from './list/list';
import { Tour_Details } from './tour_details/tour_details';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchInput, List, Tour_Details, CommonModule],
  templateUrl: './app.html',
})
export class App {
  currentSearch = '';
  tours: any[] = [];
  selectedTour: any = null;
  onTourAdded(tour: any) {
    this.tours = [...this.tours, tour];
  }
}