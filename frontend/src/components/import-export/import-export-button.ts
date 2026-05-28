import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; gap: 8px; align-items: center;">

      <!-- Export button -->
      <button (click)="onExport()"
        style="
          padding: 7px 14px; border-radius: 8px; cursor: pointer;
          font-size: 13px; font-weight: 500;
          background: rgba(77,163,255,0.12); color: #185FA5;
          border: 1px solid #85B7EB;
          display: flex; align-items: center; gap: 6px;
        ">
        ⬆️ export
      </button>

      <!-- Import button -->
      <button (click)="onImport()"
        [disabled]="isImporting()"
        style="
          padding: 7px 14px; border-radius: 8px; cursor: pointer;
          font-size: 13px; font-weight: 500;
          background: rgba(100,200,100,0.12); color: #2a7a2a;
          border: 1px solid #90cc90;
          display: flex; align-items: center; gap: 6px;
          opacity: {{ isImporting() ? '0.6' : '1' }};
        ">
        @if (isImporting()) { ⏳ importing... }
        @else { ⬇️ import }
      </button>

      <!-- Feedback toast -->
      @if (feedback()) {
        <span style="
          font-size: 12px; padding: 4px 10px; border-radius: 6px;
          background: {{ feedback()!.type === 'success' ? 'rgba(80,180,80,0.15)' : 'rgba(220,60,60,0.12)' }};
          color: {{ feedback()!.type === 'success' ? '#2a7a2a' : '#a32d2d' }};
          border: 1px solid {{ feedback()!.type === 'success' ? '#90cc90' : '#f09595' }};
        ">
          {{ feedback()!.message }}
        </span>
      }
    </div>
  `
})
export class ImportExportButton {
  @Output() exportClicked  = new EventEmitter<void>();
  @Output() importClicked  = new EventEmitter<void>();

  isImporting = signal(false);
  feedback    = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  onExport(): void {
    this.exportClicked.emit();
  }

  onImport(): void {
    this.importClicked.emit();
  }

  showFeedback(type: 'success' | 'error', message: string): void {
    this.feedback.set({ type, message });
    setTimeout(() => this.feedback.set(null), 4000);
  }

  setImporting(v: boolean): void {
    this.isImporting.set(v);
  }
}
