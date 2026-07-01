import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportViewModel } from './import-export-button.vm';

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [CommonModule],
  providers: [ImportExportViewModel],
  templateUrl: './import-export-button.html',
})
export class ImportExportButton {
  readonly vm = inject(ImportExportViewModel);

  @Output() exportClicked = new EventEmitter<void>();
  @Output() importClicked = new EventEmitter<void>();

  onExport(): void {
    this.exportClicked.emit();
  }

  onImport(): void {
    this.importClicked.emit();
  }

  // kept as thin delegates so app.ts's existing calls
  // (btn.setImporting(...), btn.showFeedback(...)) don't need to change
  setImporting(v: boolean): void {
    this.vm.setImporting(v);
  }

  showFeedback(type: 'success' | 'error', message: string): void {
    this.vm.showFeedback(type, message);
  }
}