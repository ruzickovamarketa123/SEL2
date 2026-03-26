import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInput } from '../components/search-input/search-input';
import { List } from '../components/list/list';
import { Tour_Details } from '../components/tour_details/tour_details';
import { LoginComponent } from '../components/auth/login/login';
import { RegisterComponent } from '../components/auth/register/register';
import { TourLogList } from '../components/tourlogs_list/tourlog_list';
import { TourLogDetails } from '../components/tourlog_details/tourlog';
import { Tour } from '../components/tour_details/tour_details.model';
import { TourLog } from '../components/tourlog_details/tourlog.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchInput, List, Tour_Details, LoginComponent, RegisterComponent, TourLogList, TourLogDetails],  
  templateUrl: './app.html',
})
export class App {
  currentSearch = '';
  selectedTour: Tour | null = null;
  activeTab: 'details' | 'logs' = 'details';
  selectedLog: TourLog | null = null;

  tours = signal<Tour[]>([ 
    { id: 1, name: 'Paris City Tour', description: 'A beautiful tour of Paris.', from: 'Eiffel Tower', to: 'Louvre', transportType: 'Hike' },
    { id: 2, name: 'Tokyo Explorer', description: 'Explore the streets of Tokyo.', from: 'Shinjuku', to: 'Shibuya', transportType: 'Bike' },
    { id: 3, name: 'New York Highlights', description: 'Run through NYC landmarks.', from: 'Central Park', to: 'Times Square', transportType: 'Running' },
    { id: 4, name: 'Rome Historical Walk', description: 'Walk through ancient Rome.', from: 'Colosseum', to: 'Vatican', transportType: 'Hike' },
    { id: 5, name: 'Safari Adventure', description: 'Wildlife vacation in Kenya.', from: 'Nairobi', to: 'Maasai Mara', transportType: 'Vacation' },
  ]);

  onTourAdded(newTourData: Tour) {
    const tourWithId: Tour = { ...newTourData, id: Date.now()};

    this.tours.update((current: Tour[]) => [...current, tourWithId]);
}

  onSearchChanged(term: string) {
    this.currentSearch = term;
  }

  //When the tour is changed, the tab and the selected log are reset
  selectTour(tour: Tour) {
    this.selectedTour = tour;
    this.activeTab = 'details';
    this.selectedLog = null;
  }
}