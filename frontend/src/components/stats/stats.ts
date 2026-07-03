import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsViewModel } from './stats.vm';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  providers: [StatsViewModel],
  templateUrl: './stats.html',
})
export class StatsComponent {
  vm = inject(StatsViewModel);
}
