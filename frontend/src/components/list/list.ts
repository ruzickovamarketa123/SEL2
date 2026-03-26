import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tour } from '../tour_details/tour_details.model';
import { ListViewModel } from './list.vm';

@Component({
  selector: 'list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ListViewModel],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
})
export class List {
  readonly vm = inject(ListViewModel);

  @Input() set tours(value: Tour[]) { this.vm.allToursData.set(value); }
  @Input() set searchTerm(value: string) { this.vm.searchTerm.set(value); }

  @Output() tourSelected = new EventEmitter<Tour>();
  @Output() tourAdded = new EventEmitter<any>()

  select(tour: Tour) {
    this.vm.selectedId.set(tour.id);
    this.tourSelected.emit(tour);
  }

  // Chiamato dal tasto "Add Tour" nella modale
  confirmAdd() {
    const data = this.vm.newTour();
    this.tourAdded.emit(data); // Invia i dati al Mediatore
    this.vm.closeAddModal();
  }

  addTour() {
  const data = this.vm.newTour();
  this.tourAdded.emit(data); // Il Mediatore (App) riceve e salva
  this.vm.closeAddModal();
  }
}