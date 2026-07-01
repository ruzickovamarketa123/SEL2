import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
}