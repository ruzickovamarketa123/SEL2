import { Injectable, signal } from "@angular/core";

@Injectable()
export class SearchInputViewModel {
  searchTerm = signal('');
  showModal = signal(false);
}