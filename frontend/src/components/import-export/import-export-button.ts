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
          padding: 8px 18px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        background: rgb(73, 157, 208, 0.8);
        color: #000000;
        border: 1.5px solid #000000;
      ">
        export
      </button>

      <!-- Import button -->
      <button (click)="onImport()"
        [disabled]="isImporting()"
        style="
      padding: 8px 18px;
      background: rgba(110, 219, 80, 0.8);
      color: rgb(0, 0, 0);
      border: 1.5px solid #000000;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    ">
        @if (isImporting()) { importing... }
        @else { import }
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
