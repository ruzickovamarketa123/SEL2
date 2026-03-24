import { Component, EventEmitter, inject, Output } from "@angular/core";
import { Tour, TransportType } from "../tour_details/tour_details.model";
import { SearchInputViewModel } from "./search-input.vm";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'search-input',
  standalone: true,
  imports: [CommonModule],
  providers: [SearchInputViewModel],
  templateUrl: './search-input.html',
})

export class SearchInput {
  readonly vm = inject(SearchInputViewModel);

  @Output() tourAdded = new EventEmitter<Tour>();
  @Output() searchChanged = new EventEmitter<string>(); 


  onTyping(value: string) {
    this.searchChanged.emit(value);
  }

  addTour(name: string, desc: string, from: string, to: string, type: any) {
    
    const nuovoTour: Tour = {
      id: Date.now(), // temporary ID
      name: name,
      description: desc,
      from: from,
      to: to,
      transportType: type as TransportType
    };

    this.tourAdded.emit(nuovoTour);

    this.vm.showModal.set(false);
  }
}