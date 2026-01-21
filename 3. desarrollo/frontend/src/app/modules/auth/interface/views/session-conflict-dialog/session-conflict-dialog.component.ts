import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActiveSession } from '../../../domain/ports/auth.port';

/**
 * Diálogo para manejar conflicto de sesión activa
 * Permite al usuario cerrar la otra sesión o cancelar
 */
@Component({
  selector: 'app-session-conflict-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="session-conflict-dialog">
      <h2 mat-dialog-title class="flex items-center gap-2">
        <mat-icon color="warn">warning</mat-icon>
        Sesión Activa Detectada
      </h2>

      <mat-dialog-content>
        <p class="mb-4 text-gray-700 dark:text-gray-300">
          Ya tiene una sesión activa en otro dispositivo. ¿Desea cerrar la otra sesión e iniciar aquí?
        </p>

        @if (activeSession) {
          <div class="session-info bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <div class="flex items-center gap-2">
              <mat-icon class="text-gray-500">devices</mat-icon>
              <span class="font-medium">Dispositivo:</span>
              <span>{{ activeSession.device || 'Desconocido' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <mat-icon class="text-gray-500">language</mat-icon>
              <span class="font-medium">IP:</span>
              <span>{{ activeSession.ip || 'N/A' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <mat-icon class="text-gray-500">schedule</mat-icon>
              <span class="font-medium">Última actividad:</span>
              <span>{{ getLastActivityText() }}</span>
            </div>
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="px-6 pb-4">
        <button mat-button (click)="onCancel()" color="basic">
          Cancelar
        </button>
        <button mat-raised-button (click)="onForceLogin()" color="primary">
          Cerrar otra sesión e iniciar aquí
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .session-conflict-dialog {
      min-width: 500px;
    }

    .session-info {
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
  `],
})
export class SessionConflictDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<SessionConflictDialogComponent>);
  readonly data = inject<{ activeSession: ActiveSession }>(MAT_DIALOG_DATA);

  activeSession: ActiveSession | null = null;

  ngOnInit(): void {
    this.activeSession = this.data?.activeSession || null;
  }

  /**
   * Obtiene el texto de última actividad formateado
   */
  getLastActivityText(): string {
    if (!this.activeSession?.lastActivity) {
      return 'N/A';
    }

    const lastActivity = new Date(this.activeSession.lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    }
    if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    }
    if (diffMins > 0) {
      return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    }
    return 'Hace unos momentos';
  }

  /**
   * Maneja la acción de forzar login
   */
  onForceLogin(): void {
    this.dialogRef.close({ forceLogin: true });
  }

  /**
   * Maneja la cancelación
   */
  onCancel(): void {
    this.dialogRef.close({ forceLogin: false });
  }
}

