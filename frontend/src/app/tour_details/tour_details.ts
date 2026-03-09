import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tour_details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour_details.html',
})
export class Tour_Details {
    @Input() tour: any = null;

  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}