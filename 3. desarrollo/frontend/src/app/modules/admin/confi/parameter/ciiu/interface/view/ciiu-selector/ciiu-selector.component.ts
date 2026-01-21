import {
  Component,
  Input,
  forwardRef,
  signal,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
  catchError,
  of,
} from 'rxjs';

import { CiiuController } from '../../../infrastructure/controller/controller';
import {
  ActividadCompletaEntity,
  toActividadValue,
  ActividadValue,
  getSemaforoClass,
} from '../../../domain/entity';

/**
 * Componente selector reutilizable para Actividades Económicas CIIU
 * Implementa ControlValueAccessor para integrarse con formularios reactivos
 */
@Component({
  selector: 'app-ciiu-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CiiuSelectorComponent),
      multi: true,
    },
  ],
  templateUrl: './ciiu-selector.component.html',
  styleUrls: ['./ciiu-selector.component.scss'],
})
export class CiiuSelectorComponent implements ControlValueAccessor, OnInit {
  // Inputs
  @Input() label = 'Actividad Económica';
  @Input() placeholder = 'Buscar por descripción o código...';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() showHierarchy = true;
  @Input() required = false;

  // Services
  private readonly ciiuController = inject(CiiuController);
  private readonly destroyRef = inject(DestroyRef);

  // State
  searchControl = new FormControl('');
  loading = signal(false);
  options = signal<ActividadCompletaEntity[]>([]);
  selectedActividad = signal<ActividadValue | null>(null);
  errorMessage = signal<string>('');

  // ControlValueAccessor
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  disabled = false;

  ngOnInit(): void {
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        filter((value) => typeof value === 'string'),
        tap(() => this.loading.set(true)),
        switchMap((query) => {
          if (!query || query.length < 3) {
            this.loading.set(false);
            this.options.set([]);
            return of([]);
          }
          return this.ciiuController.searchActividades(query).pipe(
            catchError((error) => {
              console.error('Error searching actividades:', error);
              this.errorMessage.set('Error al buscar actividades');
              this.loading.set(false);
              return of([]);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (results) => {
          this.options.set(results);
          this.loading.set(false);
          this.errorMessage.set('');
        },
      });
  }

  displayFn(option: ActividadCompletaEntity): string {
    if (!option) return '';
    return `${option.ciact_abr_ciact} - ${option.ciact_des_ciact}`;
  }

  onOptionSelected(event: any): void {
    const entity: ActividadCompletaEntity = event.option.value;
    const value = toActividadValue(entity);
    this.selectedActividad.set(value);
    this.onChange(entity.ciact_cod_ciact);
    this.onTouched();
    // Actualizar el control con el texto de display
    this.searchControl.setValue(this.displayFn(entity), { emitEvent: false });
  }

  onFocus(): void {
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: number | null): void {
    if (value) {
      // Cargar actividad por ID
      this.loading.set(true);
      this.ciiuController.findActividadCompleta(value).subscribe({
        next: (entity) => {
          if (entity) {
            const actValue = toActividadValue(entity);
            this.selectedActividad.set(actValue);
            this.searchControl.setValue(this.displayFn(entity), {
              emitEvent: false,
            });
          } else {
            this.selectedActividad.set(null);
            this.searchControl.setValue('', { emitEvent: false });
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error loading actividad:', error);
          this.selectedActividad.set(null);
          this.searchControl.setValue('', { emitEvent: false });
          this.loading.set(false);
        },
      });
    } else {
      this.selectedActividad.set(null);
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    isDisabled ? this.searchControl.disable() : this.searchControl.enable();
  }

  // Método público para obtener el valor seleccionado
  getSelectedValue(): ActividadValue | null {
    return this.selectedActividad();
  }

  // Método público para limpiar la selección
  clear(): void {
    this.selectedActividad.set(null);
    this.searchControl.setValue('');
    this.onChange(null);
    this.onTouched();
  }

  // Helper para obtener clase CSS del semáforo
  getSemaforoClass(codigo: number): string {
    return getSemaforoClass(codigo);
  }
}

