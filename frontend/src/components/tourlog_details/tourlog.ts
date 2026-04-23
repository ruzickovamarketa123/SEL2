import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourLogsViewModel } from './tourlog.vm';
import { FormsModule } from '@angular/forms';
import { TourLog } from './tourlog.model';

@Component({
  selector: 'tourlog_details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [TourLogsViewModel],
  templateUrl: './tourlog.html'
})
export class TourLogDetails {
  public vm = inject(TourLogsViewModel);

  @Input() set log(value: any) {
    if (value) {
      this.vm.selectLog(value);
    }
  }

  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<TourLog>();

  onDelete() {
    const current = this.vm.selectedLog();
    if (current && confirm('Are you sure you want to delete this log?')) {
      this.delete.emit(current.id!);
    }
  }

  onSave() {
    const updated = this.vm.editData();
    if (updated) {
      this.edit.emit(updated);
      this.vm.isEditing.set(false);
    }
  }
}