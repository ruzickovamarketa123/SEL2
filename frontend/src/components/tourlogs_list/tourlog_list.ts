import { Component, Input, Output, EventEmitter, inject, computed, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourLog, difficultyType } from '../tourlog_details/tourlog.model';
import { TourLogDetails } from '../tourlog_details/tourlog';

@Component({
  selector: 'tourlogs_list',
  standalone: true,
  imports: [CommonModule, FormsModule, TourLogDetails],
  templateUrl: './tourlog_list.html',
  styleUrl: './tourlog_list.css'
})
export class TourLogList {
  @Input() tourId!: string;

  allLogsSignal = signal<TourLog[]>([]);
  @Input() set allLogs(value: TourLog[]) {
    this.allLogsSignal.set(value);
  }

  @Output() logSelected = new EventEmitter<TourLog | null>();
  @Output() logAdded = new EventEmitter<TourLog>();
  @Output() logEditRequested = new EventEmitter<any>();
  @Output() logDeleteRequested = new EventEmitter<any>();

  selectedLogId = signal<string | null>(null);

  filteredLogs = computed(() => {
    return this.allLogsSignal().filter(log => log.tourId === this.tourId);
  });

  showAddModal = signal(false);

  newLog = signal<Omit<TourLog, 'id'>>({
    tourId: '', date: '', time: '', comment: '',
    difficulty: null, totalDistance: 0, totalTime: 0, rating: 0,
  });

  openAddModal() {
    const now = new Date();
    const timeString = now.toTimeString().slice(0, 5);
    this.newLog.set({
      tourId: this.tourId,
      date: now.toISOString().split('T')[0],
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
    if (this.selectedLogId() === log.id) {
      this.selectedLogId.set(null);
      this.logSelected.emit(null);
    } else {
      this.selectedLogId.set(log.id);
      this.logSelected.emit(log);
    }
  }

  onLogEdit(event: any) { this.logEditRequested.emit(event); }
  onLogDelete(event: any) { this.logDeleteRequested.emit(event); }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tourId']) {
      this.selectedLogId.set(null);
      this.logSelected.emit(null);
    }
  }

  isNewLogValid = computed(() => {
    const log = this.newLog();
    return (
      log.date.trim() !== '' && log.time.trim() !== '' &&
      log.totalDistance > 0 && log.totalTime > 0 &&
      log.difficulty !== null && log.rating >= 1 &&
      log.rating <= 5 && log.comment.trim() !== ''
    );
  });
}