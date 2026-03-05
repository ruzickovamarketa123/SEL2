import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.html',
})
export class List {
  @Input() searchTerm = '';
  @Input() tours: any[] = [];        // ← přidat
  selectedId: number | null = null;

  allTours = [                        // ← přejmenovat tours na allTours
    { id: 1, name: 'Paris City Tour', location: 'France', duration: '3 days', price: 299 },
    { id: 2, name: 'Tokyo Explorer', location: 'Japan', duration: '5 days', price: 599 },
    { id: 3, name: 'New York Highlights', location: 'USA', duration: '2 days', price: 199 },
    { id: 4, name: 'Rome Historical Walk', location: 'Italy', duration: '4 days', price: 349 },
    { id: 5, name: 'Safari Adventure', location: 'Kenya', duration: '7 days', price: 999 },
  ];

  select(id: number) {
    this.selectedId = id;
  }

  get filteredTours() {
    return [...this.allTours, ...this.tours].filter(t =>  // ← sloučit oboje
      t.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}