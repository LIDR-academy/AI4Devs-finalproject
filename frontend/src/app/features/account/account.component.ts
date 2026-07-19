import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  imports: [MatCardModule, MatButtonModule],
  template: `
    <div class="account-page">
      <div class="account-page__bg" aria-hidden="true"></div>
      <div class="account-wrapper">
        @if (authService.currentUser(); as user) {
          <div class="account-avatar">
            {{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}
          </div>
          <h1 class="account-name">{{ user.firstName }} {{ user.lastName }}</h1>
          <p class="account-role">{{ user.role }}</p>
        }

        <mat-card class="account-card">
          <mat-card-header>
            <mat-card-title>Mi cuenta</mat-card-title>
            <mat-card-subtitle>Información de tu perfil</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (authService.currentUser(); as user) {
              <dl class="account-fields">
                <div class="account-field">
                  <dt>Nombre</dt>
                  <dd>{{ user.firstName }} {{ user.lastName }}</dd>
                </div>
                <div class="account-field">
                  <dt>Email</dt>
                  <dd>{{ user.email }}</dd>
                </div>
                <div class="account-field">
                  <dt>Rol</dt>
                  <dd><span class="account-badge">{{ user.role }}</span></dd>
                </div>
              </dl>
            }
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-stroked-button (click)="authService.logout()">Cerrar sesión</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: `
    .account-page {
      position: relative;
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 3rem 1rem;
      background: var(--ink-bg);
      overflow: hidden;
    }

    .account-page__bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201, 164, 70, 0.06) 0%, transparent 70%);
      pointer-events: none;
    }

    .account-wrapper {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 460px;
      gap: 0;
    }

    .account-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c9a446, #8b6914);
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 1px;
      margin-bottom: 12px;
      box-shadow: 0 4px 20px rgba(201, 164, 70, 0.25);
    }

    .account-name {
      margin: 0 0 4px;
      font-family: var(--ink-font-display);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--ink-text-primary);
    }

    .account-role {
      margin: 0 0 24px;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--ink-accent);
    }

    .account-card {
      width: 100%;
      border-radius: 12px !important;
      box-shadow: var(--ink-shadow-lg) !important;
      background: var(--ink-bg-card) !important;
      color: var(--ink-text-primary) !important;
    }

    .account-fields {
      display: flex;
      flex-direction: column;
      margin: 0.5rem 0 0;
    }

    .account-field {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid var(--ink-border);

      &:last-child { border-bottom: none; }

      dt {
        font-size: 0.78rem;
        font-weight: 500;
        color: var(--ink-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      dd {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--ink-text-primary);
        text-align: right;
        max-width: 60%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .account-badge {
      display: inline-block;
      background: rgba(212, 175, 55, 0.1);
      color: var(--ink-accent);
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }
  `
})
export class AccountComponent {
  protected readonly authService = inject(AuthService);
}
