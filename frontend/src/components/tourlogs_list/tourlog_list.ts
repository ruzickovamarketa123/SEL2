import { Component, Input, Output, EventEmitter, inject, computed, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourLog, difficultyType } from '../tourlog_details/tourlog.model';

@Component({
  selector: 'tourlogs_list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tourlog_list.html',
  styleUrl: './tourlog_list.css'
})
export class TourLogList {
  @Input() tourId!: number;

  private _allLogs = signal<TourLog[]>([]);
  @Input() set allLogs(value: TourLog[]) {
    this._allLogs.set(value);
  }

  @Output() logSelected = new EventEmitter<TourLog | null>();
  @Output() logAdded = new EventEmitter<TourLog>();  

  // Filter logs based on the selected tour
  filteredLogs = computed(() => {
    return this._allLogs().filter(log => log.tourId === this.tourId);
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
  showAddModal = signal(false);
  newLog = signal<Omit<TourLog, 'id'>>({
    tourId: 0, dateTime: '', comment: '',
    difficulty: null, totalDistance: 0, totalTime: 0, rating: 0,
  });

  openAddModal() {
    this.newLog.set({
      tourId: this.tourId,
      dateTime: new Date().toISOString().split('T')[0],
      comment: '', difficulty: null,
      totalDistance: 0, totalTime: 0, rating: 0,
    });
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  confirmAdd() {
    this.logAdded.emit(this.newLog() as TourLog);
    this.closeAddModal();
  }

  selectLog(log: TourLog) {
    this.logSelected.emit(log);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tourId']) {
      this.logSelected.emit(null);
    }
  }

  isNewLogValid = computed(() => {
  const log = this.newLog();
  return (
    log.dateTime.trim() !== '' && log.totalDistance > 0 && log.totalTime > 0 && log.difficulty !== null && log.rating >= 1 && log.rating <= 5 && log.comment.trim() !== ''
  );
});
}