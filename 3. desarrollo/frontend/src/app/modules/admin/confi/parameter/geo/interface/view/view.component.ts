import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GeoFacade } from 'app/modules/admin/confi/parameter/geo/application/facades/geo.facade';
import {
  ProvinciaEntity,
  CantonEntity,
  ParroquiaEntity,
  getDescripcionTipoArea,
} from 'app/modules/admin/confi/parameter/geo/domain/entity';
import { ProvinciaDialogComponent } from '../components/provincia-dialog/provincia-dialog.component';
import { CantonDialogComponent } from '../components/canton-dialog/canton-dialog.component';
import { ParroquiaDialogComponent } from '../components/parroquia-dialog/parroquia-dialog.component';

/**
 * Componente principal para gestión del Catálogo Geográfico
 * Vista jerárquica: Provincia > Cantón > Parroquia
 */
@Component({
  selector: 'app-geo-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeoCatalogComponent implements OnInit {
  readonly facade: GeoFacade = inject(GeoFacade);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Exposed signals from facade
  readonly provincias = this.facade.provinciasFiltradas;
  readonly cantones = this.facade.cantonesFiltrados;
  readonly parroquias = this.facade.parroquiasFiltradas;
  readonly selectedProvincia = this.facade.selectedProvincia;
  readonly selectedCanton = this.facade.selectedCanton;
  readonly loading = this.facade.loading;
  readonly loadingCantones = this.facade.loadingCantones;
  readonly loadingParroquias = this.facade.loadingParroquias;
  readonly showInactive = this.facade.showInactive;

  ngOnInit(): void {
    this.facade.loadProvincias();
  }

  // ==================== SELECTION ====================

  onSelectProvincia(provincia: ProvinciaEntity): void {
    this.facade.selectProvincia(provincia);
  }

  onSelectCanton(canton: CantonEntity): void {
    this.facade.selectCanton(canton);
  }

  // ==================== TOGGLE INACTIVE ====================

  onToggleInactive(): void {
    this.facade.toggleShowInactive();
    this.facade.loadProvincias();
  }

  // ==================== PROVINCIA CRUD ====================

  openProvinciaDialog(provincia?: ProvinciaEntity): void {
    const dialogRef = this.dialog.open(ProvinciaDialogComponent, {
      width: '500px',
      data: {
        mode: provincia ? 'edit' : 'create',
        provincia,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage(
          provincia
            ? 'Provincia actualizada correctamente'
            : 'Provincia creada correctamente'
        );
        this.facade.loadProvincias();
      }
    });
  }

  async onDeleteProvincia(provincia: ProvinciaEntity): Promise<void> {
    if (
      confirm(
        `¿Está seguro de eliminar la provincia "${provincia.provi_nom_provi}"?`
      )
    ) {
      try {
        await this.facade.deleteProvincia(provincia.provi_cod_provi!);
        this.showMessage('Provincia eliminada correctamente');
      } catch (error) {
        this.showMessage('Error al eliminar la provincia', true);
      }
    }
  }

  // ==================== CANTON CRUD ====================

  openCantonDialog(canton?: CantonEntity): void {
    const selectedProvincia = this.selectedProvincia();
    if (!selectedProvincia && !canton) {
      this.showMessage('Seleccione una provincia primero', true);
      return;
    }

    const dialogRef = this.dialog.open(CantonDialogComponent, {
      width: '500px',
      data: {
        mode: canton ? 'edit' : 'create',
        canton,
        provincia: selectedProvincia,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage(
          canton
            ? 'Cantón actualizado correctamente'
            : 'Cantón creado correctamente'
        );
        if (selectedProvincia) {
          this.facade.loadCantones(selectedProvincia.provi_cod_prov);
        }
      }
    });
  }

  async onDeleteCanton(canton: CantonEntity): Promise<void> {
    if (
      confirm(`¿Está seguro de eliminar el cantón "${canton.canto_nom_canto}"?`)
    ) {
      try {
        await this.facade.deleteCanton(canton.canto_cod_canto!);
        this.showMessage('Cantón eliminado correctamente');
      } catch (error) {
        this.showMessage('Error al eliminar el cantón', true);
      }
    }
  }

  // ==================== PARROQUIA CRUD ====================

  openParroquiaDialog(parroquia?: ParroquiaEntity): void {
    const selectedCanton = this.selectedCanton();
    if (!selectedCanton && !parroquia) {
      this.showMessage('Seleccione un cantón primero', true);
      return;
    }

    const dialogRef = this.dialog.open(ParroquiaDialogComponent, {
      width: '500px',
      data: {
        mode: parroquia ? 'edit' : 'create',
        parroquia,
        canton: selectedCanton,
        provincia: this.selectedProvincia(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showMessage(
          parroquia
            ? 'Parroquia actualizada correctamente'
            : 'Parroquia creada correctamente'
        );
        const selectedProvincia = this.selectedProvincia();
        if (selectedProvincia && selectedCanton) {
          this.facade.loadParroquias(
            selectedProvincia.provi_cod_prov,
            selectedCanton.canto_cod_cant
          );
        }
      }
    });
  }

  async onDeleteParroquia(parroquia: ParroquiaEntity): Promise<void> {
    if (
      confirm(
        `¿Está seguro de eliminar la parroquia "${parroquia.parro_nom_parro}"?`
      )
    ) {
      try {
        await this.facade.deleteParroquia(parroquia.parro_cod_parro!);
        this.showMessage('Parroquia eliminada correctamente');
      } catch (error) {
        this.showMessage('Error al eliminar la parroquia', true);
      }
    }
  }

  // ==================== HELPERS ====================

  private showMessage(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-error' : 'snackbar-success',
    });
  }

  /**
   * Obtiene descripción del tipo de área
   */
  getTipoAreaLabel(tipo: 'R' | 'U' | null): string {
    return getDescripcionTipoArea(tipo);
  }
}

