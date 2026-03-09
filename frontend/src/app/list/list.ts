import { Component, Input, Output, EventEmitter } from '@angular/core'; // 1. Aggiungi Output e EventEmitter
import { CommonModule } from '@angular/common';

@Component({
  selector: 'list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.html',
})
export class List {
  @Input() searchTerm = '';
  @Input() tours: any[] = [];
  
  // 2. Crea l'evento che il componente App ascolterà
  @Output() tourSelected = new EventEmitter<any>(); 

  selectedId: number | null = null;

  allTours = [
    { id: 1, name: 'Paris City Tour', location: 'France', duration: '3 days', price: 299 },
    { id: 2, name: 'Tokyo Explorer', location: 'Japan', duration: '5 days', price: 599 },
    { id: 3, name: 'New York Highlights', location: 'USA', duration: '2 days', price: 199 },
    { id: 4, name: 'Rome Historical Walk', location: 'Italy', duration: '4 days', price: 349 },
    { id: 5, name: 'Safari Adventure', location: 'Kenya', duration: '7 days', price: 999 },
  ];

  // 3. Modifica la funzione per ricevere l'intero oggetto 'tour'
  select(tour: any) {
    this.selectedId = tour.id; // Per evidenziare graficamente la riga
    this.tourSelected.emit(tour); // Invia l'oggetto al componente padre (App)
  }

  get filteredTours() {
    return [...this.allTours, ...this.tours].filter(t => 
      t.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}