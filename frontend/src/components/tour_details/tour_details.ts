import { Component, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourDetailsViewModel } from './tour_details.vm';
import { Tour } from './tour_details.model';

@Component({
  selector: 'tour_details',
  standalone: true,
  imports: [CommonModule],
  providers: [TourDetailsViewModel],
  templateUrl: './tour_details.html',
  styleUrls: ['./tour_details.css']
})
export class Tour_Details {
  readonly vm = inject(TourDetailsViewModel);

  @Input() set tour(value: Tour | null) {
    this.vm.tour.set(value);
    this.vm.setTab('details'); //reset to the details tab every time you change tours
  }

  @Output() close = this.vm.close;
  @Output() edit = this.vm.edit;
  @Output() delete = this.vm.delete;

  onClose() {
    this.vm.onClose();
  }
}