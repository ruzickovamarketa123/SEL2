import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tourlog_details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tourlog.html'
})
export class TourLogDetails {
  @Input() log: any = null; // Receives the selected log from the parent (App)
}