import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInput } from '../components/search-input/search-input';
import { List } from '../components/list/list';
import { Tour_Details } from '../components/tour_details/tour_details';
import { LoginComponent } from '../components/auth/login/login';
import { RegisterComponent } from '../components/auth/register/register';
import { TourLogList } from '../components/tourlogs_list/tourlog_list';
import { TourLogDetails } from '../components/tourlog_details/tourlog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchInput, List, Tour_Details, LoginComponent, RegisterComponent, TourLogList, TourLogDetails],  
  templateUrl: './app.html',
})
export class App {
  currentSearch = '';
  selectedTour: any = null;
  tours: any[] = [];
  activeTab: 'details' | 'logs' = 'details';
  selectedLog: any = null;

  onTourAdded(tour: any) {
    this.tours = [...this.tours, tour];
  }

  onSearchChanged(term: string) {
    this.currentSearch = term;
  }

  //When the tour is changed, the tab and the selected log are reset
  selectTour(tour: any) {
    this.selectedTour = tour;
    this.activeTab = 'details';
    this.selectedLog = null;
  }
}