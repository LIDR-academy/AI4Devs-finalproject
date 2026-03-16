import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { ClienFacade } from 'app/modules/admin/confi/management/clien/application/facades/clien.facade';
import { ClienEnum } from 'app/modules/admin/confi/management/clien/infrastructure/enum/enum';
import { ClienteCompletoEntity } from 'app/modules/admin/confi/management/clien/domain/entity';

/**
 * Componente para visualizar el detalle completo de un cliente
 * Muestra toda la información en tabs organizadas
 */
@Component({
  selector: 'app-clien-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienDetailComponent implements OnInit {
  readonly facade = inject(ClienFacade);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Exposed signals
  readonly loading = this.facade.loadingCompleto;
  readonly clienteCompleto = this.facade.clienteCompleto;

  clienteId!: number;

  // Columnas para tablas
  readonly referenciasColumns = ['tipo', 'persona', 'cuenta', 'saldo'];
  readonly informacionFinancieraColumns = ['tipo', 'institucion', 'monto', 'observaciones'];
  readonly beneficiariosColumns = ['persona', 'porcentaje'];

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClienteCompleto();
  }

  /**
   * Carga los datos del cliente completo
   */
  async loadClienteCompleto(): Promise<void> {
    try {
      await this.facade.getClienteCompletoById(this.clienteId);
    } catch (error: any) {
      this.snackBar.open(
        error?.message || ClienEnum.messages.loadError,
        'Cerrar',
        { duration: 5000 }
      );
      this.router.navigate([ClienEnum.routeList]);
    }
  }

  /**
   * Navega a la edición
   */
  onEdit(): void {
    this.router.navigate([ClienEnum.routeEdit.replace(':id', this.clienteId.toString())]);
  }

  /**
   * Regresa al listado
   */
  onBack(): void {
    this.router.navigate([ClienEnum.routeList]);
  }

  /**
   * Helpers para mostrar datos
   */
  getTipoPersonaLabel(tipo: number): string {
    return tipo === 1 ? 'Natural' : 'Jurídica';
  }

  getEsSocioLabel(esSocio: boolean): string {
    return esSocio ? 'Sí' : 'No';
  }
}

