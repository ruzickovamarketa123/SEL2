import { Injectable, inject, signal, computed } from '@angular/core';
import { Tour } from '../components/tour_details/tour_details.model';
import { TourLog } from '../components/tourlog_details/tourlog.model';
import { TourService } from './tour.service';
import { TourLogService } from './tourlog.service';
import { ImportExportService } from './import-export.service';

@Injectable({ providedIn: 'root' })
export class Mediator {
  private tourService = inject(TourService);
  private tourLogService = inject(TourLogService);
  private importExportService = inject(ImportExportService);

  tours          = signal<Tour[]>([]);
  tourLogs       = signal<TourLog[]>([]);
  selectedTourId = signal<string | null>(null);
  selectedLogId  = signal<string | null>(null);
  activeTab      = signal<'details' | 'logs'>('details');
  searchTerm     = signal('');

  private searchDebounceTimer: any;

  enrichedTours = computed(() => {
    const currentLogs = this.tourLogs();
    return this.tours().map(tour => ({
      ...tour,
      popularity:        this.calculatePopularity(tour.id, currentLogs),
      childFriendliness: this.calculateChildFriendliness(tour.id, currentLogs)
    }));
  });

  selectedTour = computed(() => {
    const id = this.selectedTourId();
    if (id === null) return null;
    return this.enrichedTours().find(t => t.id === id) || null;
  });

  selectedLog = computed(() =>
    this.tourLogs().find(l => l.id === this.selectedLogId()) ?? null
  );

  logsForTour(tourId: string) {
    return computed(() => this.tourLogs().filter(l => l.tourId === tourId));
  }

  async loadData() {
    const [tours, logs] = await Promise.all([
      this.tourService.findAll(),
      this.tourLogService.findAll()
    ]);
    this.tours.set(tours);
    this.tourLogs.set(logs);
  }

  clearData() {
    this.tours.set([]);
    this.tourLogs.set([]);
    this.selectedTourId.set(null);
    this.selectedLogId.set(null);
    this.searchTerm.set('');
  }

  onSearchChanged(term: string) {
    this.searchTerm.set(term);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(async () => {
      if (term.trim().length < 2) {
        this.tours.set(await this.tourService.findAll());
      } else {
        this.tours.set(await this.tourService.search(term.trim()));
      }
    }, 300);
  }

  async pickImportFile(): Promise<File | null> {
  return this.importExportService.openFilePicker();
  }

  selectTour(tour: Tour) {
    this.selectedTourId.set(tour.id);
    this.activeTab.set('details');
    this.selectedLogId.set(null);
  }

  closeTour() {
    this.selectedTourId.set(null);
  }

  async addTour(newTourData: Tour) {
    const created = await this.tourService.create(newTourData);
    this.tours.update(current => [...current, created]);
  }

  async editTour(updatedTour: Tour) {
    const updated = await this.tourService.update(updatedTour);
    this.tours.update(list => list.map(t => t.id === updated.id ? updated : t));
  }

  async deleteTour(tourId: string) {
    await this.tourService.delete(tourId);
    this.tours.update(list => list.filter(t => t.id !== tourId));
    if (this.selectedTourId() === tourId) {
      this.selectedTourId.set(null);
    }
  }

  selectLog(log: TourLog | null) {
    this.selectedLogId.set(log?.id ?? null);
  }

  async addLog(newLog: TourLog) {
    const created = await this.tourLogService.create(newLog);
    this.tourLogs.update(list => [...list, created]);
  }

  async editLog(updated: TourLog) {
    const saved = await this.tourLogService.update(updated);
    this.tourLogs.update(list => list.map(l => l.id === saved.id ? saved : l));
  }

  async deleteLog(id: string) {
    await this.tourLogService.delete(id);
    this.tourLogs.update(list => list.filter(l => l.id !== id));
    if (this.selectedLogId() === id) {
      this.selectedLogId.set(null);
    }
  }

  async exportTours(): Promise<void> {
    const allLogs = await this.tourLogService.findAll();
    await this.importExportService.exportAllTours(this.tours(), allLogs);
  }

  async importTours(file: File) {
    const result = await this.importExportService.importTours(file);
    const [tours, logs] = await Promise.all([
      this.tourService.findAll(),
      this.tourLogService.findAll()
    ]);
    this.tours.set(tours);
    this.tourLogs.set(logs);
    return result;
  }

  private calculatePopularity(tourId: string, allLogs: TourLog[]): number {
    const logs = allLogs.filter(l => l.tourId === tourId);
    if (logs.length === 0) return 0;
    return Math.min(5, logs.length);
  }

  private calculateChildFriendliness(tourId: string, allLogs: TourLog[]): number {
    const logs = allLogs.filter(l => l.tourId === tourId);
    if (logs.length === 0) return 0;

    let score = 5;
    if      (logs.some(l => l.difficulty === 'Expert')) score -= 3;
    else if (logs.some(l => l.difficulty === 'Hard'))   score -= 2;
    else if (logs.some(l => l.difficulty === 'Medium')) score -= 1;

    const avgDistance = logs.reduce((s, l) => s + l.totalDistance, 0) / logs.length;
    if      (avgDistance > 15) score -= 2;
    else if (avgDistance > 8)  score -= 1;

    const avgTime = logs.reduce((s, l) => s + l.totalTime, 0) / logs.length;
    if      (avgTime > 240) score -= 2;
    else if (avgTime > 120) score -= 1;

    return Math.max(1, score);
  }
}