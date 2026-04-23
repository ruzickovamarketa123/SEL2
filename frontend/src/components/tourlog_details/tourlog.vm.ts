import { Injectable, signal, computed } from '@angular/core';
import { TourLog } from './tourlog.model';

@Injectable()
export class TourLogsViewModel {
  
  allLogs = signal<TourLog[]>([]);
  selectedLogId = signal<string | null>(null);
  isEditing = signal(false);
  editData = signal<TourLog | null>(null);

  selectedLog = computed(() => 
    this.allLogs().find(log => log.id === this.selectedLogId()) || null
  );

  selectLog(log: TourLog) {
    this.allLogs.set([log]); //the log is loaded into the internal array so that the computed can find it
    this.selectedLogId.set(log.id!);
    this.isEditing.set(false); // Reset if log is changed
  }

  startEdit() {
    const current = this.selectedLog();
    if (current) {
      this.editData.set({ ...current }); // copy for the form
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editData.set(null);
  }
}