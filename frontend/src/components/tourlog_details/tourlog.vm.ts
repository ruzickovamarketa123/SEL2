import { Injectable, signal, computed } from '@angular/core';
import { TourLog } from './tourlog.model';

@Injectable()
export class TourLogsViewModel {
  
  allLogs = signal<TourLog[]>([]);
  selectedLogId = signal<number | null>(null);

  selectedLog = computed(() => 
    this.allLogs().find(log => log.id === this.selectedLogId()) || null
  );

  selectLog(id: number) {
    this.selectedLogId.set(id);
  }
}