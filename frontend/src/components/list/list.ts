import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tour } from '../tour_details/tour_details.model';
import { ListViewModel } from './list.vm';

@Component({
  selector: 'list',
  standalone: true,
  imports: [CommonModule],
  providers: [ListViewModel],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
})
export class List {
  readonly vm = inject(ListViewModel);

  // Transform the inputs into signals to trigger the computes in the VM
  @Input() set searchTerm(value: string) { this.vm.searchTerm.set(value); }
  @Input() set tours(value: Tour[]) { this.vm.toursFromInput.set(value); }

  @Output() tourSelected = new EventEmitter<Tour>();

  select(tour: Tour) {
    this.vm.selectTour(tour.id);
    this.tourSelected.emit(tour);
  }
}