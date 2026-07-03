import { Injectable, inject, signal } from '@angular/core';
import { TourLog } from './tourlog.model';
import { Mediator } from '../../services/mediator.service';

@Injectable()
export class TourLogsViewModel {
  private mediator = inject(Mediator);

  selectedLog = this.mediator.selectedLog;
  isEditing = signal(false);
  editData = signal<TourLog | null>(null);
  errorMessage = signal<string | null>(null);

  startEdit() {
    const current = this.selectedLog();
    if (current) {
      this.editData.set({ ...current });
      this.errorMessage.set(null);
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editData.set(null);
    this.errorMessage.set(null);
  }

  onDelete() {
    const current = this.selectedLog();
    if (current && confirm('Are you sure you want to delete this log?')) {
      this.mediator.deleteLog(current.id!);
    }
  }

  isEditValid(): boolean {
    const log = this.editData();
    if (!log) return false;
    return log.date.trim() !== '' && log.time.trim() !== '' &&
      log.totalDistance > 0 && log.totalTime > 0 &&
      log.difficulty !== null && log.rating >= 1 && log.rating <= 5 &&
      log.comment.trim() !== '';
  }

  async onSave() {
    const updated = this.editData();
    if (!updated || !this.isEditValid()) {
      this.errorMessage.set('please fill in all fields correctly.');
      return;
    }
    try {
      await this.mediator.editLog(updated);
      this.isEditing.set(false);
      this.editData.set(null);
      this.errorMessage.set(null);
    } catch (e) {
      this.errorMessage.set('could not save changes. please try again.');
    }
  }
}