import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthFacade } from '../../../application/facades/auth.facade';
import { interval, Subscription } from 'rxjs';

/**
 * Componente que muestra el estado de conexión del servidor
 * Actualiza automáticamente cada 30 segundos
 */
@Component({
  selector: 'app-server-status',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="server-status-container">
      <mat-icon
        [class]="statusClass"
        [matTooltip]="tooltipText"
        matTooltipPosition="below"
      >
        {{ statusIcon }}
      </mat-icon>
    </div>
  `,
  styles: [`
    .server-status-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .status-online {
      color: #10b981; /* green */
    }

    .status-offline {
      color: #ef4444; /* red */
    }

    .status-checking {
      color: #f59e0b; /* yellow/amber */
    }
  `],
})
export class ServerStatusIndicatorComponent implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  private statusSubscription?: Subscription;
  private pollingSubscription?: Subscription;

  statusIcon = 'cloud_sync';
  statusClass = 'status-checking';
  tooltipText = 'Verificando conexión...';

  ngOnInit(): void {
    // Suscribirse al estado del servidor
    this.statusSubscription = this.authFacade.serverOnline$.subscribe((isOnline) => {
      this.updateStatus(isOnline);
    });

    // Verificar estado cada 30 segundos
    this.pollingSubscription = interval(30000).subscribe(() => {
      this.authFacade.checkServerStatus();
    });

    // Verificar estado inicial
    this.authFacade.checkServerStatus();
  }

  ngOnDestroy(): void {
    this.statusSubscription?.unsubscribe();
    this.pollingSubscription?.unsubscribe();
  }

  private updateStatus(isOnline: boolean): void {
    if (isOnline) {
      this.statusIcon = 'cloud_done';
      this.statusClass = 'status-online';
      this.tooltipText = 'Servidor en línea';
    } else {
      this.statusIcon = 'cloud_off';
      this.statusClass = 'status-offline';
      this.tooltipText = 'Sin conexión al servidor';
    }
  }
}

