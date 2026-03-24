import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tour } from '../tour_details/tour_details.model';
import { ListViewModel } from './list.vm';

@Component({
  selector: 'list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ListViewModel],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
})
export class List {
  readonly vm = inject(ListViewModel);

  @Input() set searchTerm(value: string) { this.vm.searchTerm.set(value); }

  @Output() tourSelected = new EventEmitter<Tour>();

  select(tour: Tour) {
    this.vm.selectTour(tour.id);
    this.tourSelected.emit(tour);
  }
}