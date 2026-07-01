import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInput } from '../components/search-input/search-input';
import { List } from '../components/list/list';
import { LoginComponent } from '../components/auth/login/login';
import { RegisterComponent } from '../components/auth/register/register';
import { MapComponent } from '../components/map/map-component';
import { AuthService } from '../services/auth.service';
import { ProfileComponent } from '../components/auth/profile/profile';
import { ImportExportButton } from '../components/import-export/import-export-button';
import { Mediator } from '../services/mediator.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchInput, List, LoginComponent, ProfileComponent, RegisterComponent, MapComponent, ImportExportButton],
  templateUrl: './app.html',
})
export class App {
  readonly mediator = inject(Mediator);
  readonly ORS_API_KEY = environment.orsApiKey;

  constructor(public authService: AuthService) {
    effect(() => {
      if (authService.isLoggedIn()) {
        this.mediator.loadData();
      } else {
        this.mediator.clearData();
      }
    });
  }

  async onExport(): Promise<void> {
    await this.mediator.exportTours();
  }

  async onImport(btn: ImportExportButton): Promise<void> {
    const file = await this.mediator.pickImportFile();
    if (!file) return;

    btn.setImporting(true);
    try {
      const result = await this.mediator.importTours(file);
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