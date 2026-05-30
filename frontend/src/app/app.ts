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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchInput, List, LoginComponent, ProfileComponent,  RegisterComponent, MapComponent, ImportExportButton],
  templateUrl: './app.html',
})
export class App {

  constructor(public authService: AuthService, private tourService: TourService, private tourLogService: TourLogService) {
    // Observer pattern via effect — automatically reacts to login/logout state changes
    effect(() => {
      if (authService.isLoggedIn()) {
        this.loadData();
      } else {
        this.clearData();
      }
    });
  }

  readonly ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg0ODE5ZTI1ZTFmMjA3OTIxMTYxZmYyYWM5MTllMTEwMzUzNzE4ODE4Zjk0MDFhNTFjZmJhYjE1IiwiaCI6Im11cm11cjY0In0=';
  currentSearch = '';
  selectedTourId = signal<string | null>(null);
  selectedLog = signal<TourLog | null>(null);
  activeTab = signal<'details' | 'logs'>('details');
  tours = signal<Tour[]>([]);
  tourLogs = signal<TourLog[]>([]);
  private importExportService = inject(ImportExportService);

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
  }

  // Computed signal for the currently selected tour —
  // updates automatically when selectedTourId or tours list changes
  selectedTour = computed(() => {
    const id = this.selectedTourId();
    if (id === null) return null;
    return this.enrichedTours().find(t => t.id === id) || null;
  });

  // Mediator pattern — enriches tours with computed stats from logs
  enrichedTours = computed(() => {
    const currentLogs = this.tourLogs();
    const currentTours = this.tours();
    return currentTours.map(tour => ({
      ...tour,
      popularity: this.calculatePopularity(tour.id, currentLogs),
      childFriendliness: this.calculateChildFriendliness(tour.id, currentLogs)
    }));
  });

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

  // Mediator method — receives new tour from ListComponent and persists it
  async onTourAdded(newTourData: Tour) {
    const created = await this.tourService.create(newTourData);
    this.tours.update((current: Tour[]) => [...current, created]);
  }

  onSearchChanged(term: string) {
    this.currentSearch = term;
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
    this.tours.update(currentTours => currentTours.filter(t => t.id !== tourId));
    if (this.selectedTourId() === tourId) {
      this.selectedTourId.set(null);
    }
  }

  calculatePopularity(tourId: string, allLogs: TourLog[]): number {
    const tourLogs = allLogs.filter(log => log.tourId === tourId);
    if (tourLogs.length === 0) return 0;
    return Math.min(5, tourLogs.length);
  }

  calculateChildFriendliness(tourId: string, allLogs: TourLog[]): number {
    const tourLogs = allLogs.filter(log => log.tourId === tourId);
    if (tourLogs.length === 0) return 0;

    let score = 5;

    const hasExpert = tourLogs.some(l => l.difficulty === 'Expert');
    const hasHard = tourLogs.some(l => l.difficulty === 'Hard');
    const hasMedium = tourLogs.some(l => l.difficulty === 'Medium');

    if (hasExpert) score -= 3;
    else if (hasHard) score -= 2;
    else if (hasMedium) score -= 1;

    const avgDistance = tourLogs.reduce((sum, log) => sum + log.totalDistance, 0) / tourLogs.length;
    if (avgDistance > 15) score -= 2;
    else if (avgDistance > 8) score -= 1;

    const avgTime = tourLogs.reduce((sum, log) => sum + log.totalTime, 0) / tourLogs.length;
    if (avgTime > 240) score -= 2;
    else if (avgTime > 120) score -= 1;

    return Math.max(1, score);
  }

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