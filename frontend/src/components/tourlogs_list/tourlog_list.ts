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

  allLogsSignal = signal<TourLog[]>([]);
  @Input() set allLogs(value: TourLog[]) {
    this.allLogsSignal.set(value);
  }

  @Output() logSelected = new EventEmitter<TourLog | null>();
  @Output() logAdded = new EventEmitter<TourLog>();  

  // filter logs based on the selected tour
  filteredLogs = computed(() => {
    return this.allLogsSignal().filter(log => log.tourId === this.tourId);
  });


  showAddModal = signal(false);

  //use all the properties of TourLog except id, which will be generated from the parent
  newLog = signal<Omit<TourLog, 'id'>>({
    tourId: 0, date: '', time: '', comment: '',
    difficulty: null, totalDistance: 0, totalTime: 0, rating: 0,
  });

  openAddModal() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5); //HH:MM
    this.newLog.set({
      tourId: this.tourId,
      date: now.toISOString().split('T')[0], //YYYY-MM-DD
      time: timeString,    
      comment: '', 
      difficulty: null,
      totalDistance: 0, 
      totalTime: 0, 
      rating: 0,
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

  // Resets the selected log whenever the tourId input changes to ensure 
  // that details from a previous tour are not displayed.
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tourId']) {
      this.logSelected.emit(null);
    }
  }

  isNewLogValid = computed(() => {
  const log = this.newLog();
  return (
    log.date.trim() !== '' && log.time.trim() !== '' && log.totalDistance > 0 && log.totalTime > 0 && log.difficulty !== null && log.rating >= 1 && log.rating <= 5 && log.comment.trim() !== ''
  );
});
}