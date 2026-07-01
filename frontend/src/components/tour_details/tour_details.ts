import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourDetailsViewModel } from './tour_details.vm';

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
}