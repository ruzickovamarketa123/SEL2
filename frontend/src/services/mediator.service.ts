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
  minPopularity        = signal(0);
  minChildFriendliness = signal(0);

  //timer used to debounce search input
  private searchDebounceTimer: any;

  // popularity / child-friendliness come computed from the backend on the Tour DTO itself
  enrichedTours = computed(() => this.tours());

  selectedTour = computed(() => {
    const id = this.selectedTourId();
    if (id === null) return null;
    return this.tours().find(t => t.id === id) || null;
  });

  selectedLog = computed(() =>
    this.tourLogs().find(l => l.id === this.selectedLogId()) ?? null
  );

  logsForTour(tourId: string) {
    return computed(() => this.tourLogs().filter(l => l.tourId === tourId));
  }

  // ── data loading ────────────────────────────────────────────────────────
  // Loads logs first, then tours — because executeSearch() needs the
  // backend to compute popularity/child-friendliness, 
  // which depends on log data already being available.
  async loadData() {
    const logs = await this.tourLogService.findAll(); //GET /api/logs
    this.tourLogs.set(logs);
    await this.executeSearch();
  }

  clearData() {
    this.tours.set([]);
    this.tourLogs.set([]);
    this.selectedTourId.set(null);
    this.selectedLogId.set(null);
    this.searchTerm.set('');
    this.minPopularity.set(0);
    this.minChildFriendliness.set(0);
  }

  // ── search & filters ─────────────────────────────────────────────────────
  onSearchChanged(term: string) {
    this.searchTerm.set(term);
    // Debounce: cancel any pending search still waiting from a previous keystroke, 
    // then schedule a new one 300ms from now
    // If the user keeps typing, this keeps resetting
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => this.executeSearch(), 300);
  }

  onFiltersChanged() {
    this.executeSearch();
  }

  // The single place that actually calls the backend search endpoint.
  // Private: only this class is allowed to trigger it directly
  private async executeSearch() {
    const results = await this.tourService.search(
      this.searchTerm().trim(),
      this.minPopularity(),
      this.minChildFriendliness()
    );
    this.tours.set(results);
  }

  // ── tour selection ───────────────────────────────────────────────────────
  selectTour(tour: Tour) {
    this.selectedTourId.set(tour.id);
    this.activeTab.set('details');
    this.selectedLogId.set(null);
  }

  closeTour() {
    this.selectedTourId.set(null);
  }

  // ── tour CRUD ────────────────────────────────────────────────────────────
  //call the backend via tourService
  // then re-run executeSearch() so `tours` reflects the fresh state from the database
  async addTour(newTourData: Tour) {
    await this.tourService.create(newTourData);
    await this.executeSearch();
  }

  async editTour(updatedTour: Tour) {
    await this.tourService.update(updatedTour);
    await this.executeSearch();
  }

  async deleteTour(tourId: string) {
    await this.tourService.delete(tourId);
    if (this.selectedTourId() === tourId) {
      this.selectedTourId.set(null);
    }
    await this.executeSearch();
  }

  // ── log selection ────────────────────────────────────────────────────────
  selectLog(log: TourLog | null) {
    this.selectedLogId.set(log?.id ?? null);
  }

  // ── log CRUD ─────────────────────────────────────────────────────────────
  async addLog(newLog: TourLog) {
    const created = await this.tourLogService.create(newLog);
    this.tourLogs.update(list => [...list, created]);
    await this.executeSearch(); // a new log can change popularity / child-friendliness
  }

  async editLog(updated: TourLog) {
    const saved = await this.tourLogService.update(updated);
    this.tourLogs.update(list => list.map(l => l.id === saved.id ? saved : l));
    await this.executeSearch();
  }

  async deleteLog(id: string) {
    await this.tourLogService.delete(id);
    this.tourLogs.update(list => list.filter(l => l.id !== id));
    if (this.selectedLogId() === id) {
      this.selectedLogId.set(null);
    }
    await this.executeSearch();
  }

  // ── import / export ──────────────────────────────────────────────────────
  async exportTours(): Promise<void> {
    // Export needs ALL logs (not filtered/searched ones), 
    // so it fetches them fresh here
    const allLogs = await this.tourLogService.findAll();
    await this.importExportService.exportAllTours(this.tours(), allLogs);
  }

  async importTours(file: File) {
    const result = await this.importExportService.importTours(file);
    // After import, both tours and logs may have changed - refresh both.
    const logs = await this.tourLogService.findAll();
    this.tourLogs.set(logs);
    await this.executeSearch();
    return result;
  }

  async pickImportFile(): Promise<File | null> {
    return this.importExportService.openFilePicker();
  }
}