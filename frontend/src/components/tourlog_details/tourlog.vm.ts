import { Injectable, inject, signal } from '@angular/core';
import { TourLog } from './tourlog.model';
import { Mediator } from '../../services/mediator.service';

@Injectable()
export class TourLogsViewModel {
  private mediator = inject(Mediator);

  selectedLog = this.mediator.selectedLog;
  isEditing = signal(false);
  editData = signal<TourLog | null>(null);

  startEdit() {
    const current = this.selectedLog();
    if (current) {
      this.editData.set({ ...current });
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editData.set(null);
  }

  onDelete() {
    const current = this.selectedLog();
    if (current && confirm('Are you sure you want to delete this log?')) {
      this.mediator.deleteLog(current.id!);
    }
  }

  onSave() {
    const updated = this.editData();
    if (updated) {
      this.mediator.editLog(updated);
      this.isEditing.set(false);
    }
  }
}