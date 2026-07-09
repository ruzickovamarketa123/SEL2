import { Injectable } from '@angular/core';
import { Tour } from '../components/tour_details/tour_details.model';
import { TourLog } from '../components/tourlog_details/tourlog.model';
import { TourService } from './tour.service';
import { TourLogService } from './tourlog.service';

export interface TourExportData {
  exportedAt: string;
  version: string;
  tours: TourWithLogs[];
}

export interface TourWithLogs extends Tour {
  logs: TourLog[];
}

@Injectable({ providedIn: 'root' })
export class ImportExportService {

  constructor(
    private tourService: TourService,
    private tourLogService: TourLogService
  ) {}

  // ─── EXPORT ────────────────────────────────────────────────────────────────

  async exportAllTours(tours: Tour[], allLogs: TourLog[]): Promise<void> {
     // For each tour, attach only the logs that belong to it
    const toursWithLogs: TourWithLogs[] = tours.map(tour => ({
      ...tour,
      logs: allLogs.filter(log => log.tourId === tour.id)
    }));

    const exportData: TourExportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      tours: toursWithLogs
    };

    // JSON.stringify(data, null, 2): the "2" adds 2-space indentation
    const json = JSON.stringify(exportData, null, 2);

    // A Blob represents a raw chunk of data the browser can treat as a
    // virtual file, entirely in memory — nothing is written to disk yet.
    const blob = new Blob([json], { type: 'application/json' });

    // Creates a temporary local URL (like "blob:http://localhost:4200/...")
    // that only the current browser tab understands, pointing at that Blob.
    const url  = URL.createObjectURL(blob);

    //create an invisible DOM element, configure it, and simulate a click
    //The "download" attribute forces the browser to save the file instead of navigating to it.
    const a = document.createElement('a');
    a.href     = url;
    a.download = `tours-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── IMPORT ────────────────────────────────────────────────────────────────

  // Reads a .json file the user picked and recreates every tour (and its
  // logs) through the normal backend create() calls 
  // every tour goes through the exact same path as if the user had typed into the Add Tour form.
  async importTours(file: File): Promise<{ imported: number; errors: string[] }> {
    const text = await file.text();
    let data: TourExportData;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Invalid JSON file.');
    }

    if (!data.tours || !Array.isArray(data.tours)) {
      throw new Error('Invalid format: missing "tours" array.');
    }

    let imported = 0;
    const errors: string[] = [];

    for (const tourData of data.tours) {
      try {
        // Strip id so the backend generates a new one, avoiding conflicts.
        // Also strip distance and estimatedTime so the backend recalculates
        // them fresh via the OpenRouteService API call in TourService.create().
        const { id, logs, popularity, childFriendliness, distance, estimatedTime, ...tourPayload } = tourData;

        const createdTour = await this.tourService.create(tourPayload as Tour);

        // Import logs for this tour with the new tour id
        if (logs && logs.length > 0) {
          for (const log of logs) {
            try {
              const { id: logId, ...logPayload } = log;
              await this.tourLogService.create({
                ...logPayload,
                tourId: createdTour.id
              } as TourLog);
            } catch {
              errors.push(`Log for "${tourData.name}" could not be imported.`);
            }
          }
        }

        imported++;
      } catch {
        errors.push(`Tour "${tourData.name ?? 'unknown'}" could not be imported.`);
      }
    }

    return { imported, errors };
  }

  // ─── FILE PICKER HELPER ────────────────────────────────────────────────────

  openFilePicker(): Promise<File | null> {
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type   = 'file';
      input.accept = '.json';
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.oncancel = () => resolve(null);
      input.click();
    });
  }
}