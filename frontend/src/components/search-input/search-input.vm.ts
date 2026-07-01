import { Injectable, inject } from '@angular/core';
import { Mediator } from '../../services/mediator.service';

@Injectable()
export class SearchInputViewModel {
  private mediator = inject(Mediator);

  searchTerm = this.mediator.searchTerm;

  search(term: string) {
    this.mediator.onSearchChanged(term);
  }
}