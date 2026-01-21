import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';

import { ClienFacade } from 'app/modules/admin/confi/management/clien/application/facades/clien.facade';
import { ClienEntity, PersoEntity } from 'app/modules/admin/confi/management/clien/domain/entity';
import { ClienEnum } from 'app/modules/admin/confi/management/clien/infrastructure/enum/enum';

/**
 * Componente principal para gestión de Clientes
 * Vista de listado con filtros y acciones CRUD
 */
@Component({
  selector: 'app-clien-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienListComponent implements OnInit {
  readonly facade = inject(ClienFacade);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  // Exposed signals from facade
  readonly clientes = this.facade.clientesFiltered;
  readonly loading = this.facade.loadingClientes;
  readonly showInactive = this.facade.showInactive;
  readonly totalClientes = this.facade.totalClientes;
  readonly pageClientes = this.facade.pageClientes;
  readonly limitClientes = this.facade.limitClientes;

  // Exponer ClienEnum para template
  readonly ClienEnum = ClienEnum;

  // Table columns
  readonly displayedColumns: string[] = [
    'identificacion',
    'nombre',
    'tipoPersona',
    'esSocio',
    'oficina',
    'fechaIngreso',
    'acciones',
  ];

  // Filters
  searchIdentificacion = '';
  searchNombre = '';
  filterEsSocio: boolean | null = null;
  filterOficinaId: number | null = null;

  ngOnInit(): void {
    this.loadClientes();
  }

  // ==================== LOAD DATA ====================

  loadClientes(): void {
    const params = {
      identificacion: this.searchIdentificacion || undefined,
      nombre: this.searchNombre || undefined,
      esSocio: this.filterEsSocio ?? undefined,
      oficinaId: this.filterOficinaId ?? undefined,
      active: !this.facade.showInactive(),
      page: this.facade.pageClientes(),
      limit: this.facade.limitClientes(),
    };

    this.facade.loadClientes(params).catch((error) => {
      this.snackBar.open(
        error?.message || ClienEnum.messages.loadError,
        'Cerrar',
        { duration: 5000 }
      );
    });
  }

  // ==================== PAGINATION ====================

  onPageChange(event: PageEvent): void {
    // La paginación se maneja en el facade
    this.loadClientes();
  }

  // ==================== FILTERS ====================

  onSearch(): void {
    this.loadClientes();
  }

  onClearFilters(): void {
    this.searchIdentificacion = '';
    this.searchNombre = '';
    this.filterEsSocio = null;
    this.filterOficinaId = null;
    this.loadClientes();
  }

  onToggleInactive(): void {
    this.facade.toggleShowInactive();
    this.loadClientes();
  }

  // ==================== ACTIONS ====================

  onCreate(): void {
    this.router.navigate([ClienEnum.routeCreate]);
  }

  onView(cliente: ClienEntity): void {
    this.router.navigate([ClienEnum.routeView.replace(':id', cliente.clien_cod_clien!.toString())]);
  }

  onEdit(cliente: ClienEntity): void {
    this.router.navigate([ClienEnum.routeEdit.replace(':id', cliente.clien_cod_clien!.toString())]);
  }

  async onDelete(cliente: ClienEntity): Promise<void> {
    if (!confirm(`¿Está seguro de eliminar el cliente ${cliente.persona?.perso_nom_perso}?`)) {
      return;
    }

    try {
      await this.facade.deleteCliente(cliente.clien_cod_clien!);
      this.snackBar.open(
        ClienEnum.messages.deleteSuccess,
        'Cerrar',
        { duration: 3000 }
      );
      this.loadClientes();
    } catch (error: any) {
      this.snackBar.open(
        error?.message || ClienEnum.messages.deleteError,
        'Cerrar',
        { duration: 5000 }
      );
    }
  }

  // ==================== HELPERS ====================

  getTipoPersonaLabel(tipo: number): string {
    return tipo === 1 ? 'Natural' : 'Jurídica';
  }

  getEsSocioLabel(esSocio: boolean): string {
    return esSocio ? 'Sí' : 'No';
  }
}

