import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourLogsViewModel } from './tourlog.vm';

@Component({
  selector: 'tourlog_details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [TourLogsViewModel],
  templateUrl: './tourlog.html'
})
export class TourLogDetails {
  public vm = inject(TourLogsViewModel);
  onDelete() { this.vm.onDelete(); }
  onSave() { this.vm.onSave(); }
}