import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInput } from '../components/search-input/search-input';
import { List } from '../components/list/list';
import { Tour_Details } from '../components/tour_details/tour_details';
import { MapComponent } from '../components/map/map-component';   

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchInput, List, Tour_Details, MapComponent],  
  templateUrl: './app.html',
})
export class App {
  currentSearch = '';
  selectedTour: any = null;
  tours: any[] = [];

  onTourAdded(tour: any) {
    this.tours = [...this.tours, tour];
  }
}