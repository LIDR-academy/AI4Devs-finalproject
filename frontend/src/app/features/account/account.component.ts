import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  imports: [MatCardModule, MatButtonModule],
  template: `
    <div class="account-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Mi cuenta</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (authService.currentUser(); as user) {
            <p><strong>Nombre:</strong> {{ user.firstName }} {{ user.lastName }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Rol:</strong> {{ user.role }}</p>
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-stroked-button (click)="authService.logout()">Cerrar sesión</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .account-container {
      display: flex;
      justify-content: center;
      padding: 2rem 1rem;
    }
    mat-card {
      width: 100%;
      max-width: 420px;
    }
  `
})
export class AccountComponent {
  protected readonly authService = inject(AuthService);
}
