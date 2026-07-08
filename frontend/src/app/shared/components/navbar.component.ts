import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="bg-card-bg border-b border-border px-6 py-4 flex items-center justify-between">
      <a routerLink="/" class="text-2xl font-heading text-primary font-bold">Aura</a>
      <div class="flex items-center gap-4">
        @if (auth.isAuthenticated()) {
          <a routerLink="/dashboard" class="text-text-secondary hover:text-primary transition-colors">Dashboard</a>
          <button (click)="logout()" class="text-error hover:text-error-dark transition-colors px-4 py-2 border border-error rounded-md">Logout</button>
        } @else {
          <a routerLink="/login" class="text-text-secondary hover:text-primary transition-colors">Login</a>
        }
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);

  logout() {
    this.auth.logout().subscribe();
  }
}
