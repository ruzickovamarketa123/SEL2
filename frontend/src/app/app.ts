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

  searchTerm     = signal('');     
  private searchDebounceTimer: any;  

  minPopularity        = signal(0);
  minChildFriendliness = signal(0);

  selectedTourId = signal<string | null>(null);
  selectedLog    = signal<TourLog | null>(null);
  activeTab      = signal<'details' | 'logs'>('details');
  tours          = signal<Tour[]>([]);
  tourLogs       = signal<TourLog[]>([]);
  private importExportService = inject(ImportExportService);

  // ── data loading ────────────────────────────────────────────────────────────

  async loadData() {
    const logs = await this.tourLogService.findAll();
    this.tourLogs.set(logs);
    await this.executeSearch();
  }

  clearData() {
    this.tours.set([]);
    this.tourLogs.set([]);
    this.selectedTourId.set(null);
    this.selectedLog.set(null);
    this.searchTerm.set('');
    this.minPopularity.set(0);
    this.minChildFriendliness.set(0);
  }

  // ── search & filtri ───────────────────────────────────────────────────────────

  onSearchChanged(term: string) {
    this.searchTerm.set(term);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => this.executeSearch(), 300);
  }

  onFiltersChanged() {
    this.executeSearch();
  }

  private async executeSearch() {
    const results = await this.tourService.search(
      this.searchTerm().trim(),
      this.minPopularity(),
      this.minChildFriendliness()
    );
    this.tours.set(results);
  }

  // ── computed ────────────────────────────────────────────────────────────────

  selectedTour = computed(() => {
    const id = this.selectedTourId();
    if (id === null) return null;
    return this.tours().find(t => t.id === id) || null;
  });


  // ── tour CRUD ────────────────────────────────────────────────────────────────

  async onTourAdded(newTourData: Tour) {
    await this.tourService.create(newTourData);
    await this.executeSearch();
  }

  selectTour(tour: Tour) {
    this.selectedTourId.set(tour.id);
    this.activeTab.set('details');
    this.selectedLog.set(null);
  }

  async onEditTour(updatedTour: Tour) {
    await this.tourService.update(updatedTour);
    await this.executeSearch();
  }

  async onDeleteTour(tourId: string) {
    await this.tourService.delete(tourId);
    if (this.selectedTourId() === tourId) {
      this.selectedTourId.set(null);
    }
    await this.executeSearch();
  }

  // ── log CRUD ─────────────────────────────────────────────────────────────────


  async onLogAdded(newLog: TourLog) {
    const created = await this.tourLogService.create(newLog);
    this.tourLogs.update(list => [...list, created]);
    await this.executeSearch();
  }

  async onEditLog(updated: TourLog) {
    const saved = await this.tourLogService.update(updated);
    this.tourLogs.update(list => list.map(l => l.id === saved.id ? saved : l));
    if (this.selectedLog()?.id === saved.id) {
      this.selectedLog.set({ ...saved });
    }
    await this.executeSearch();
  }

  async onDeleteLog(id: string) {
    await this.tourLogService.delete(id);
    this.tourLogs.update(list => list.filter(l => l.id !== id));
    if (this.selectedLog()?.id === id) {
      this.selectedLog.set(null);
    }
    await this.executeSearch();
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
      const logs = await this.tourLogService.findAll();
      this.tourLogs.set(logs);
      await this.executeSearch();

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
