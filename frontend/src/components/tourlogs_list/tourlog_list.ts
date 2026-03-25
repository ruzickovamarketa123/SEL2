import { Component, Input, Output, EventEmitter, inject, computed, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourLog } from '../tourlog_details/tourlog.model';

@Component({
  selector: 'tourlogs_list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tourlog_list.html'
})
export class TourLogList {
  @Input() tourId!: number;
  @Output() logSelected = new EventEmitter<any>();

  private allLogs = signal<TourLog[]>([
    { id: 1, tourId: 1, dateTime: '2023-10-01', totalDistance: 12.5, rating: 4, comment: 'First TourLog' , difficulty: 'Medium', totalTime: 90},
    { id: 2, tourId: 1, dateTime: '2023-10-05', totalDistance: 5.0, rating: 3, comment: 'Second TourLog' , difficulty: 'Easy', totalTime: 60},
    { id: 3, tourId: 2, dateTime: '2023-10-10', totalDistance: 20.2, rating: 5, comment: 'First TourLog' , difficulty: 'Hard', totalTime: 120},
  ]);

  // Filter logs based on the selected tour
  filteredLogs = computed(() => {
    return this.allLogs().filter(log => log.tourId === this.tourId);
  });

  // based on number of logs
    popularity = computed(() => {
    const count = this.filteredLogs().length;
    if (count >= 5) return 5;
    else return count;
    });

    child_friendliness = computed(() => {
    const count = this.filteredLogs().length;
    if(count === 0) return 0; // No logs, can't determine child-friendliness
    return 1
    });

  // This is to "react" when the tourId changes from outside
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tourId']) {
      this.logSelected.emit(null); // Reset the selected log when the tour changes
    }
  }

  selectLog(log: any) {
    this.logSelected.emit(log);
  }
}