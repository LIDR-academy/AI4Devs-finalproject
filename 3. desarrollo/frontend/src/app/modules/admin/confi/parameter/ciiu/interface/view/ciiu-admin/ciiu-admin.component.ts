import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule, FlatTreeControl } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CiiuFacade } from '../../../application/facades/ciiu.facade';
import { ArbolCiiuEntity, getSemaforoClass } from '../../../domain/entity';

/**
 * Componente de administración del Catálogo CIIU
 * Muestra vista de árbol jerárquico y permite búsqueda
 */
@Component({
  selector: 'app-ciiu-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './ciiu-admin.component.html',
  styleUrls: ['./ciiu-admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CiiuAdminComponent implements OnInit {
  readonly facade = inject(CiiuFacade);

  // Exposed signals from facade
  readonly arbol = this.facade.arbol;
  readonly loadingArbol = this.facade.loadingArbol;
  readonly error = this.facade.error;

  // Local state
  searchQuery = signal<string>('');

  ngOnInit(): void {
    this.facade.loadArbol();
  }

  /**
   * Verifica si un nodo tiene hijos
   */
  hasChild = (_: number, node: ArbolCiiuEntity) => {
    // Los nodos de nivel 6 (actividades) no tienen hijos
    return node.nivel < 6;
  };

  /**
   * Obtiene la clase CSS para el semáforo
   */
  getSemaforoClass(codigo: number | null | undefined): string {
    return getSemaforoClass(codigo);
  }

  /**
   * Obtiene el icono según el nivel
   */
  getIconForLevel(nivel: number): string {
    const icons: Record<number, string> = {
      1: 'folder',
      2: 'folder_open',
      3: 'category',
      4: 'label',
      5: 'bookmark',
      6: 'description',
    };
    return icons[nivel] || 'circle';
  }

  /**
   * Recarga el árbol
   */
  reloadArbol(): void {
    this.facade.loadArbol();
  }
}

