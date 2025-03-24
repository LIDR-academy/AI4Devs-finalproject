import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ReaderMode } from '@shared/types/reading.types';
@Injectable({
  providedIn: 'root'
})
export class ReaderModeService {
  private modeSubject = new BehaviorSubject<ReaderMode>('pdf');
  currentMode$ = this.modeSubject.asObservable();

  setMode(mode: ReaderMode) {
    this.modeSubject.next(mode);
  }

  getMode(): ReaderMode {
    return this.modeSubject.getValue();
  }
} 