import { Component, computed, signal } from '@angular/core';
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
import { MapComponent } from '../components/map/map-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchInput, List, Tour_Details, LoginComponent, RegisterComponent, TourLogList, TourLogDetails, MapComponent],  
  templateUrl: './app.html',
})
export class App {
  //shared state as signals
  currentSearch = '';
  selectedTourId = signal<number | null>(null);
  selectedLog: TourLog | null = null;
  activeTab = signal<'details' | 'logs'>('details');

  // shared reactive state managed here so all components stay in sync
  tours = signal<Tour[]>([ 
    { id: 1, name: 'Paris City Tour', description: 'A beautiful tour of Paris.', from: 'Eiffel Tower', to: 'Louvre', transportType: 'Hike' },
    { id: 2, name: 'Tokyo Explorer', description: 'Explore the streets of Tokyo.', from: 'Shinjuku', to: 'Shibuya', transportType: 'Bike' },
    { id: 3, name: 'New York Highlights', description: 'Run through NYC landmarks.', from: 'Central Park', to: 'Times Square', transportType: 'Running' },
    { id: 4, name: 'Rome Historical Walk', description: 'Walk through ancient Rome.', from: 'Colosseum', to: 'Vatican', transportType: 'Hike' },
    { id: 5, name: 'Safari Adventure', description: 'Wildlife vacation in Kenya.', from: 'Nairobi', to: 'Maasai Mara', transportType: 'Vacation' },
  ]);

    // shared reactive state managed here so all components stay in sync
  tourLogs = signal<TourLog[]>([
    { id: 1, tourId: 1, date: '2023-10-01', time: '12:00:00', totalDistance: 5.5, rating: 4, comment: 'first TourLog', difficulty: 'Easy', totalTime: 70 },
    { id: 2, tourId: 1, date: '2023-10-05', time: '14:30:00', totalDistance: 5.0, rating: 3, comment: 'second TourLog', difficulty: 'Easy', totalTime: 60 },
    { id: 3, tourId: 2, date: '2023-10-10', time: '09:15:00', totalDistance: 20.2, rating: 5, comment: 'first TourLog', difficulty: 'Hard', totalTime: 120 },
  ]);

  // computed signal for the currently selected tour
  // it updates when either the selectedTourId or the tours list changes
  selectedTour = computed(() => {
    const id = this.selectedTourId();
    if (id === null) return null;
    return this.enrichedTours().find(t => t.id === id) || null;
  });

  //computed signal
  enrichedTours = computed(() => {
    const currentLogs = this.tourLogs();
    const currentTours = this.tours();

    return currentTours.map(tour => ({
      ...tour,
      popularity: this.calculatePopularity(tour.id, currentLogs),
      childFriendliness: this.calculateChildFriendliness(tour.id, currentLogs)
    }));
  });

  // mediator method 
  onLogAdded(newLog: TourLog) {
    const logWithId: TourLog = { ...newLog, id: Date.now() };
    this.tourLogs.update(list => [...list, logWithId]);
  }

  onEditLog(updated: TourLog) {
    this.tourLogs.update(list => list.map(l => l.id === updated.id ? updated : l));
    if (this.selectedLog?.id === updated.id) {
      this.selectedLog = { ...updated };
    }
  }

  onDeleteLog(id: number) {
    this.tourLogs.update(list => list.filter(l => l.id !== id));
    if (this.selectedLog?.id === id) {
      this.selectedLog = null;
    }
  }

  // mediator method - recieves new tour from ListComponent, assigns unique ID, updates the shared signal
  onTourAdded(newTourData: Tour) {
    const tourWithId: Tour = { ...newTourData, id: Date.now()};

    this.tours.update((current: Tour[]) => [...current, tourWithId]);
}

  onSearchChanged(term: string) {
    this.currentSearch = term;
  }

  //when the tour is changed, the tab and the selected log are reset
  selectTour(tour: Tour) {
    this.selectedTourId.set(tour.id);
    this.activeTab.set('details');
    this.selectedLog = null;
  }

  onEditTour(updatedTour: Tour) {
    this.tours.update(list => list.map(t => t.id === updatedTour.id ? updatedTour : t));
  }

  onDeleteTour(tourId: number) {
    // removes the tour from the list by filtering by ID
    this.tours.update(currentTours => currentTours.filter(t => t.id !== tourId));

    //close the details if the cancelled tour was displayed
    if (this.selectedTourId() === tourId) {
      this.selectedTourId.set(null);
    }
  }

  calculatePopularity(tourId: number, allLogs: TourLog[]): number {
    const tourLogs = allLogs.filter(log => log.tourId === tourId);
    if (tourLogs.length === 0) return 0; // no data
    
    // 1 star per log, max 5 stars
    return Math.min(5, tourLogs.length);
  }

  calculateChildFriendliness(tourId: number, allLogs: TourLog[]): number {
    const tourLogs = allLogs.filter(log => log.tourId === tourId);
    if (tourLogs.length === 0) return 0; // no data

    let score = 5; // we start from the maximum score

    // 1. penalties for difficulty levels
    // if there's at least one Expert log, it's not child-friendly
    // If there's at least one Hard log, it's less child-friendly, etc.
    const hasExpert = tourLogs.some(l => l.difficulty === 'Expert');
    const hasHard = tourLogs.some(l => l.difficulty === 'Hard');
    const hasMedium = tourLogs.some(l => l.difficulty === 'Medium');

    if (hasExpert) score -= 3;
    else if (hasHard) score -= 2;
    else if (hasMedium) score -= 1;

    // 2. penalties for average distance 
    const avgDistance = tourLogs.reduce((sum, log) => sum + log.totalDistance, 0) / tourLogs.length;
    if (avgDistance > 15) score -= 2; // more than 15km is quite long for kids
    else if (avgDistance > 8) score -= 1;

    // 3. penalties for average time
    const avgTime = tourLogs.reduce((sum, log) => sum + log.totalTime, 0) / tourLogs.length;
    if (avgTime > 240) score -= 2; // more than 4 hours
    else if (avgTime > 120) score -= 1; // more than 2 hours

    // Ensure the score never goes below 1 star
    return Math.max(1, score);
  }
}