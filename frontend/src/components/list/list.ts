import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tour } from '../tour_details/tour_details.model';

@Component({
  selector: 'list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
})
export class List {
  @Input() searchTerm = '';
  @Input() tours: Tour[] = [];

  @Output() tourSelected = new EventEmitter<Tour>();

  selectedId: number | null = null;

  allTours: Tour[] = [
    { id: 1, name: 'Paris City Tour', description: 'A beautiful tour of Paris.', from: 'Eiffel Tower', to: 'Louvre', transportType: 'Hike' },
    { id: 2, name: 'Tokyo Explorer', description: 'Explore the streets of Tokyo.', from: 'Shinjuku', to: 'Shibuya', transportType: 'Bike' },
    { id: 3, name: 'New York Highlights', description: 'Run through NYC landmarks.', from: 'Central Park', to: 'Times Square', transportType: 'Running' },
    { id: 4, name: 'Rome Historical Walk', description: 'Walk through ancient Rome.', from: 'Colosseum', to: 'Vatican', transportType: 'Hike' },
    { id: 5, name: 'Safari Adventure', description: 'Wildlife vacation in Kenya.', from: 'Nairobi', to: 'Maasai Mara', transportType: 'Vacation' },
  ];

  select(tour: Tour) {
    this.selectedId = tour.id;
    this.tourSelected.emit(tour);
  }

  get filteredTours(): Tour[] {
    return [...this.allTours, ...this.tours].filter(t =>
      t.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}