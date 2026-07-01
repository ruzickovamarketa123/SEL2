import { Component, Input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourLog } from '../tourlog_details/tourlog.model';
import { TourLogDetails } from '../tourlog_details/tourlog';
import { Mediator } from '../../services/mediator.service';

@Component({
  selector: 'tourlogs_list',
  standalone: true,
  imports: [CommonModule, FormsModule, TourLogDetails],
  templateUrl: './tourlog_list.html',
  styleUrl: './tourlog_list.css'
})
export class TourLogList {
  private mediator = inject(Mediator);

  @Input() tourId!: string;

  selectedLogId = this.mediator.selectedLogId;

  filteredLogs = computed(() =>
    this.mediator.tourLogs().filter(log => log.tourId === this.tourId)
  );

  showAddModal = signal(false);

  newLog = signal<Omit<TourLog, 'id'>>({
    tourId: '', date: '', time: '', comment: '',
    difficulty: null, totalDistance: 0, totalTime: 0, rating: 0,
  });

  openAddModal() {
    const now = new Date();
    this.newLog.set({
      tourId: this.tourId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      comment: '', difficulty: null,
      totalDistance: 0, totalTime: 0, rating: 0,
    });
    this.showAddModal.set(true);
  }

  closeAddModal() { this.showAddModal.set(false); }

  confirmAdd() {
    this.mediator.addLog(this.newLog() as TourLog);
    this.closeAddModal();
  }

  selectLog(log: TourLog) {
    this.mediator.selectLog(this.selectedLogId() === log.id ? null : log);
  }

  isNewLogValid = computed(() => {
    const log = this.newLog();
    return log.date.trim() !== '' && log.time.trim() !== '' &&
      log.totalDistance > 0 && log.totalTime > 0 &&
      log.difficulty !== null && log.rating >= 1 && log.rating <= 5 &&
      log.comment.trim() !== '';
  });
}