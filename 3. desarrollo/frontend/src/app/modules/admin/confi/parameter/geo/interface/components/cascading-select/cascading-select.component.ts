import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  signal,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GeoRepository } from '../../../../infrastructure/repository/repository';
import {
  ProvinciaEntity,
  CantonEntity,
  ParroquiaEntity,
} from '../../../../domain/entity';

export interface ParroquiaSeleccionada {
  parroquiaId: number;
  provinciaCodigoSeps: string;
  cantonCodigoSeps: string;
  parroquiaCodigoSeps: string;
  codigoCompleto: string;
  nombre: string;
  tipoArea: 'R' | 'U' | null;
}

/**
 * Componente reutilizable para selección en cascada de División Política
 */
@Component({
  selector: 'app-cascading-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CascadingSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="cascading-select flex flex-col md:flex-row gap-4">
      <!-- Provincia -->
      <mat-form-field class="flex-1" appearance="outline">
        <mat-label>Provincia</mat-label>
        <mat-select
          [value]="selectedProvinciaId()"
          (selectionChange)="onProvinciaChange($event.value)"
          [disabled]="disabled()">
          @for (provincia of provincias(); track provincia.provi_cod_provi) {
            <mat-option [value]="provincia.provi_cod_provi">
              {{ provincia.provi_cod_prov }} - {{ provincia.provi_nom_provi }}
            </mat-option>
          }
        </mat-select>
        @if (loadingProvincias()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        }
      </mat-form-field>

      <!-- Cantón -->
      <mat-form-field class="flex-1" appearance="outline">
        <mat-label>Cantón</mat-label>
        <mat-select
          [value]="selectedCantonId()"
          (selectionChange)="onCantonChange($event.value)"
          [disabled]="disabled() || !selectedProvinciaId()">
          @for (canton of cantones(); track canton.canto_cod_canto) {
            <mat-option [value]="canton.canto_cod_canto">
              {{ canton.canto_cod_cant }} - {{ canton.canto_nom_canto }}
            </mat-option>
          }
        </mat-select>
        @if (loadingCantones()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        }
      </mat-form-field>

      <!-- Parroquia -->
      <mat-form-field class="flex-1" appearance="outline">
        <mat-label>Parroquia</mat-label>
        <mat-select
          [value]="selectedParroquiaId()"
          (selectionChange)="onParroquiaChange($event.value)"
          [disabled]="disabled() || !selectedCantonId()">
          @for (parroquia of parroquias(); track parroquia.parro_cod_parro) {
            <mat-option [value]="parroquia.parro_cod_parro">
              {{ parroquia.parro_cod_parr }} - {{ parroquia.parro_nom_parro }}
              @if (parroquia.parro_tip_area) {
                <span class="text-xs text-gray-500 ml-2">
                  ({{ parroquia.parro_tip_area === 'U' ? 'Urbana' : 'Rural' }})
                </span>
              }
            </mat-option>
          }
        </mat-select>
        @if (loadingParroquias()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        }
      </mat-form-field>
    </div>
  `,
  styles: [
    `
      .cascading-select {
        width: 100%;
      }
    `,
  ],
})
export class CascadingSelectComponent implements OnInit, ControlValueAccessor {
  private readonly repository = inject(GeoRepository);

  // Inputs
  @Input() showInactive = false;

  // Outputs
  @Output() selectionChange = new EventEmitter<ParroquiaSeleccionada | null>();

  // Data signals
  readonly provincias = signal<ProvinciaEntity[]>([]);
  readonly cantones = signal<CantonEntity[]>([]);
  readonly parroquias = signal<ParroquiaEntity[]>([]);

  // Selection signals
  readonly selectedProvinciaId = signal<number | null>(null);
  readonly selectedCantonId = signal<number | null>(null);
  readonly selectedParroquiaId = signal<number | null>(null);

  // Loading signals
  readonly loadingProvincias = signal<boolean>(false);
  readonly loadingCantones = signal<boolean>(false);
  readonly loadingParroquias = signal<boolean>(false);

  // Disabled state
  readonly disabled = signal<boolean>(false);

  // ControlValueAccessor callbacks
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.loadProvincias();
  }

  // ==================== DATA LOADING ====================

  private async loadProvincias(): Promise<void> {
    this.loadingProvincias.set(true);
    try {
      const response = await this.repository.getProvincias(!this.showInactive);
      this.provincias.set(response.data);
    } catch (error) {
      console.error('Error loading provincias:', error);
    } finally {
      this.loadingProvincias.set(false);
    }
  }

  private async loadCantones(provinciaCodigoSeps: string): Promise<void> {
    this.loadingCantones.set(true);
    try {
      const response = await this.repository.getCantonesByProvincia(
        provinciaCodigoSeps,
        !this.showInactive
      );
      this.cantones.set(response.data);
    } catch (error) {
      console.error('Error loading cantones:', error);
    } finally {
      this.loadingCantones.set(false);
    }
  }

  private async loadParroquias(
    provinciaCodigoSeps: string,
    cantonCodigoSeps: string
  ): Promise<void> {
    this.loadingParroquias.set(true);
    try {
      const response = await this.repository.getParroquiasByCanton(
        provinciaCodigoSeps,
        cantonCodigoSeps,
        !this.showInactive
      );
      this.parroquias.set(response.data);
    } catch (error) {
      console.error('Error loading parroquias:', error);
    } finally {
      this.loadingParroquias.set(false);
    }
  }

  // ==================== SELECTION HANDLERS ====================

  onProvinciaChange(provinciaId: number): void {
    this.selectedProvinciaId.set(provinciaId);
    this.selectedCantonId.set(null);
    this.selectedParroquiaId.set(null);
    this.cantones.set([]);
    this.parroquias.set([]);

    const provincia = this.provincias().find(
      (p) => p.provi_cod_provi === provinciaId
    );
    if (provincia) {
      this.loadCantones(provincia.provi_cod_prov);
    }

    this.emitChange(null);
  }

  onCantonChange(cantonId: number): void {
    this.selectedCantonId.set(cantonId);
    this.selectedParroquiaId.set(null);
    this.parroquias.set([]);

    const provincia = this.provincias().find(
      (p) => p.provi_cod_provi === this.selectedProvinciaId()
    );
    const canton = this.cantones().find((c) => c.canto_cod_canto === cantonId);

    if (provincia && canton) {
      this.loadParroquias(provincia.provi_cod_prov, canton.canto_cod_cant);
    }

    this.emitChange(null);
  }

  onParroquiaChange(parroquiaId: number): void {
    this.selectedParroquiaId.set(parroquiaId);

    const parroquia = this.parroquias().find(
      (p) => p.parro_cod_parro === parroquiaId
    );
    const canton = this.cantones().find(
      (c) => c.canto_cod_canto === this.selectedCantonId()
    );
    const provincia = this.provincias().find(
      (p) => p.provi_cod_provi === this.selectedProvinciaId()
    );

    if (parroquia && canton && provincia) {
      const seleccion: ParroquiaSeleccionada = {
        parroquiaId: parroquia.parro_cod_parro!,
        provinciaCodigoSeps: provincia.provi_cod_prov,
        cantonCodigoSeps: canton.canto_cod_cant,
        parroquiaCodigoSeps: parroquia.parro_cod_parr,
        codigoCompleto: `${provincia.provi_cod_prov}${canton.canto_cod_cant}${parroquia.parro_cod_parr}`,
        nombre: parroquia.parro_nom_parro,
        tipoArea: parroquia.parro_tip_area,
      };
      this.emitChange(parroquiaId);
      this.selectionChange.emit(seleccion);
    }
  }

  private emitChange(value: number | null): void {
    this.onChange(value);
    this.onTouched();
  }

  // ==================== ControlValueAccessor ====================

  writeValue(value: number | null): void {
    if (value) {
      this.selectedParroquiaId.set(value);
      // TODO: Load hierarchy from parroquia ID if needed
    } else {
      this.selectedProvinciaId.set(null);
      this.selectedCantonId.set(null);
      this.selectedParroquiaId.set(null);
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

