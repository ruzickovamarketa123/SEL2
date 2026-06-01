import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourDetailsViewModel } from './tour_details.vm';
import { Tour } from './tour_details.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'tour_details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [TourDetailsViewModel],
  templateUrl: './tour_details.html',
  styleUrls: ['./tour_details.css']
})
export class Tour_Details {
  readonly vm = inject(TourDetailsViewModel);

  @Input() set tour(value: Tour | null) {
    this.vm.tour.set(value);
  }

  @Input() orsApiKey: string = '';

  @Output() edit = new EventEmitter<Tour>();
  @Output() delete = new EventEmitter<string>();

  constructor() {
    this.vm.edit.subscribe(tour => this.edit.emit(tour));
    this.vm.delete.subscribe(id => this.delete.emit(id));
  }
}