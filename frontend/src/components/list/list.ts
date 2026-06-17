import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tour } from '../tour_details/tour_details.model';
import { TourLog } from '../tourlog_details/tourlog.model';
import { ListViewModel } from './list.vm';
import { Tour_Details } from '../tour_details/tour_details';
import { TourLogList } from '../tourlogs_list/tourlog_list';

@Component({
  selector: 'list',
  standalone: true,
  imports: [CommonModule, FormsModule, Tour_Details, TourLogList],
  providers: [ListViewModel],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
})
export class List {
  readonly vm = inject(ListViewModel);

  @Input() set tours(value: Tour[]) { this.vm.allToursData.set(value); }
  @Input() set searchTerm(value: string) { this.vm.searchTerm.set(value); }
  @Input() set selectedTourId(value: string | null) { this.vm.selectedId.set(value); }
  @Input() activeTab: 'details' | 'logs' = 'details';
  @Input() allLogs: TourLog[] = [];
  @Input() selectedLog: TourLog | undefined = undefined;
  @Input() orsApiKey: string = '';

  @Output() tourSelected = new EventEmitter<Tour>();
  @Output() tourAdded = new EventEmitter<any>();
  @Output() activeTabChange = new EventEmitter<'details' | 'logs'>();
  @Output() tourEdited = new EventEmitter<any>();
  @Output() tourDeleted = new EventEmitter<any>();
  @Output() logSelected = new EventEmitter<TourLog | null>();
  @Output() logAdded = new EventEmitter<any>();
  @Output() logEdited = new EventEmitter<any>();
  @Output() logDeleted = new EventEmitter<any>();
  @Output() tourClosed = new EventEmitter<void>();

  select(tour: Tour) {
    this.vm.selectedId.set(tour.id);
    this.tourSelected.emit(tour);
  }

  addTour() {
    if (!this.vm.isFormValid()) {
      this.vm.errorMessage.set('please fill in all required fields.');
      return;
    }
    this.tourAdded.emit(this.vm.newTour());
    this.vm.closeAddModal();
  }
}