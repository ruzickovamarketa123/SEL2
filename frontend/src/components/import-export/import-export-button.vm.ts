import { Injectable, signal } from '@angular/core';

export interface ImportExportFeedback {
  type: 'success' | 'error';
  message: string;
}

@Injectable()
export class ImportExportViewModel {
  isImporting = signal(false);
  feedback    = signal<ImportExportFeedback | null>(null);

  setImporting(v: boolean): void {
    this.isImporting.set(v);
  }

  showFeedback(type: 'success' | 'error', message: string): void {
    this.feedback.set({ type, message });
    setTimeout(() => this.feedback.set(null), 4000);
  }
}