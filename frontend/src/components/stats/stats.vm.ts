import { Injectable, inject, signal, computed } from '@angular/core';
import { Mediator } from '../../services/mediator.service';
import { TourService } from '../../services/tour.service';
import { Tour } from '../tour_details/tour_details.model';

export interface DifficultyBreakdown {
  difficulty: string;
  count: number;
  percentage: number;
}

export interface MostActiveTour {
  name: string;
  count: number;
}

@Injectable()
export class StatsViewModel {
  private mediator = inject(Mediator);
  private tourService = inject(TourService);

  isVisible = signal(false);
  isLoading = signal(false);

  // Full tour list, independent of any active search/filter — the top bar's
  // "min pop" / "min kids" filters narrow mediator.tours(), which would make
  // "tours created" and "most logged tour" misleading if we read from there.
  private allTours = signal<Tour[]>([]);

  private logs = this.mediator.tourLogs;

  async open(): Promise<void> {
    this.isVisible.set(true);
    this.isLoading.set(true);
    try {
      this.allTours.set(await this.tourService.findAll()); // GET /api/tours
    } catch {
      this.allTours.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  close(): void {
    this.isVisible.set(false);
  }

  totalTours = computed(() => this.allTours().length);

  totalLogs = computed(() => this.logs().length);

  totalDistanceKm = computed(() =>
    this.logs().reduce((sum, log) => sum + (log.totalDistance || 0), 0)
  );

  totalHours = computed(() =>
    this.logs().reduce((sum, log) => sum + (log.totalTime || 0), 0) / 60
  );

  averageRating = computed(() => {
    const logs = this.logs();
    if (logs.length === 0) return 0;
    return logs.reduce((sum, log) => sum + (log.rating || 0), 0) / logs.length;
  });

  mostActiveTour = computed<MostActiveTour | null>(() => {
    const tours = this.allTours();
    const logs = this.logs();
    if (tours.length === 0 || logs.length === 0) return null;

    //count how many logs exist for each tourId
    const countByTour = new Map<string, number>();
    for (const log of logs) {
      // countByTour.get(log.tourId) returns undefined the FIRST time a given tourId is seen
      // The ?? 0 says "if there's no count yet, treat it as zero"
      // then +1 for the log currently being processed.
      countByTour.set(log.tourId, (countByTour.get(log.tourId) ?? 0) + 1);
    }

    let best: MostActiveTour | null = null;
    for (const tour of tours) {
      const count = countByTour.get(tour.id) ?? 0;
      if (count > 0 && (!best || count > best.count)) {
        best = { name: tour.name, count };
      }
    }
    return best;
  });

  difficultyBreakdown = computed<DifficultyBreakdown[]>(() => {
    const logs = this.logs();
    const order = ['Easy', 'Medium', 'Hard', 'Expert'];
    const counts = new Map<string, number>();
    for (const log of logs) {
      if (log.difficulty) {
        counts.set(log.difficulty, (counts.get(log.difficulty) ?? 0) + 1);
      }
    }
    const total = logs.length;
    return order
      // Only keep difficulty levels that actually have at least one log
      .filter(d => counts.has(d))
      // Turn each difficulty name into a full breakdown object.
      .map(d => ({
        difficulty: d,
        count: counts.get(d)!,
        percentage: total > 0 ? Math.round((counts.get(d)! / total) * 100) : 0
      }));
  });

  hasData = computed(() => this.totalLogs() > 0);
}
