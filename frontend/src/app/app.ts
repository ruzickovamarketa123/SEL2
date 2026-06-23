import { Component, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInput } from '../components/search-input/search-input';
import { List } from '../components/list/list';
import { LoginComponent } from '../components/auth/login/login';
import { RegisterComponent } from '../components/auth/register/register';
import { Tour } from '../components/tour_details/tour_details.model';
import { TourLog } from '../components/tourlog_details/tourlog.model';
import { MapComponent } from '../components/map/map-component';
import { TourService } from '../services/tour.service';
import { TourLogService } from '../services/tourlog.service';
import { AuthService } from '../services/auth.service';
import { ProfileComponent } from '../components/auth/profile/profile';
import { ImportExportService } from '../services/import-export.service';
import { ImportExportButton } from '../components/import-export/import-export-button';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchInput, List, LoginComponent, ProfileComponent, RegisterComponent, MapComponent, ImportExportButton],
  templateUrl: './app.html',
})
export class App {

  constructor(public authService: AuthService, private tourService: TourService, private tourLogService: TourLogService) {
    effect(() => {
      if (authService.isLoggedIn()) {
        this.loadData();
      } else {
        this.clearData();
      }
    });
  }

  readonly ORS_API_KEY = environment.orsApiKey;

  searchTerm     = signal('');        // reactive search term
  private searchDebounceTimer: any;   // debounce handle

  selectedTourId = signal<string | null>(null);
  selectedLog    = signal<TourLog | null>(null);
  activeTab      = signal<'details' | 'logs'>('details');
  tours          = signal<Tour[]>([]);
  tourLogs       = signal<TourLog[]>([]);
  private importExportService = inject(ImportExportService);

  // ── data loading ────────────────────────────────────────────────────────────

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
    this.selectedLog.set(null);
    this.searchTerm.set('');
  }

  // ── search ──────────────────────────────────────────────────────────────────

  /**
   * Called by SearchInput on every keystroke.
   * Debounces 300ms so we don't hit the backend on every character.
   * Empty/short terms reload all tours instead of searching.
   */
  onSearchChanged(term: string) {
    this.searchTerm.set(term);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(async () => {
      if (term.trim().length < 2) {
        // too short — just reload everything
        const tours = await this.tourService.findAll();
        this.tours.set(tours);
      } else {
        const results = await this.tourService.search(term.trim());
        this.tours.set(results);
      }
    }, 300);
  }

  // ── computed ────────────────────────────────────────────────────────────────

  selectedTour = computed(() => {
    const id = this.selectedTourId();
    if (id === null) return null;
    return this.enrichedTours().find(t => t.id === id) || null;
  });

  enrichedTours = computed(() => {
    const currentLogs = this.tourLogs();
    return this.tours().map(tour => ({
      ...tour,
      popularity:        this.calculatePopularity(tour.id, currentLogs),
      childFriendliness: this.calculateChildFriendliness(tour.id, currentLogs)
    }));
  });

  // ── tour CRUD ────────────────────────────────────────────────────────────────

  async onTourAdded(newTourData: Tour) {
    const created = await this.tourService.create(newTourData);
    this.tours.update(current => [...current, created]);
  }

  selectTour(tour: Tour) {
    this.selectedTourId.set(tour.id);
    this.activeTab.set('details');
    this.selectedLog.set(null);
  }

  async onEditTour(updatedTour: Tour) {
    const updated = await this.tourService.update(updatedTour);
    this.tours.update(list => list.map(t => t.id === updated.id ? updated : t));
  }

  async onDeleteTour(tourId: string) {
    await this.tourService.delete(tourId);
    this.tours.update(list => list.filter(t => t.id !== tourId));
    if (this.selectedTourId() === tourId) {
      this.selectedTourId.set(null);
    }
  }

  // ── log CRUD ─────────────────────────────────────────────────────────────────

  async onLogAdded(newLog: TourLog) {
    const created = await this.tourLogService.create(newLog);
    this.tourLogs.update(list => [...list, created]);
  }

  async onEditLog(updated: TourLog) {
    const saved = await this.tourLogService.update(updated);
    this.tourLogs.update(list => list.map(l => l.id === saved.id ? saved : l));
    if (this.selectedLog()?.id === saved.id) {
      this.selectedLog.set({ ...saved });
    }
  }

  async onDeleteLog(id: string) {
    await this.tourLogService.delete(id);
    this.tourLogs.update(list => list.filter(l => l.id !== id));
    if (this.selectedLog()?.id === id) {
      this.selectedLog.set(null);
    }
  }

  // ── computed attributes ───────────────────────────────────────────────────────

  calculatePopularity(tourId: string, allLogs: TourLog[]): number {
    const logs = allLogs.filter(l => l.tourId === tourId);
    if (logs.length === 0) return 0;
    return Math.min(5, logs.length);
  }

  calculateChildFriendliness(tourId: string, allLogs: TourLog[]): number {
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

  // ── import / export ────────────────────────────────────────────────────────────

  async onExport(): Promise<void> {
    const allLogs = await this.tourLogService.findAll();
    await this.importExportService.exportAllTours(this.tours(), allLogs);
  }

  async onImport(btn: ImportExportButton): Promise<void> {
    const file = await this.importExportService.openFilePicker();
    if (!file) return;

    btn.setImporting(true);
    try {
      const result = await this.importExportService.importTours(file);
      const [tours, logs] = await Promise.all([
        this.tourService.findAll(),
        this.tourLogService.findAll()
      ]);
      this.tours.set(tours);
      this.tourLogs.set(logs);

      const msg = result.errors.length > 0
        ? `Imported ${result.imported} tour(s). ${result.errors.length} error(s).`
        : `✓ Imported ${result.imported} tour(s) successfully!`;
      btn.showFeedback(result.errors.length > 0 ? 'error' : 'success', msg);

    } catch (err: any) {
      btn.showFeedback('error', err.message ?? 'Import failed.');
    } finally {
      btn.setImporting(false);
    }
  }
}
