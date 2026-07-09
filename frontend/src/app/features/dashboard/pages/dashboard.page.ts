import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="padding: 2rem;">
      <h2>Welcome to your Dashboard!</h2>
      <p style="margin-bottom: 2rem;">You don't have any events yet.</p>
      <a routerLink="/events/new" style="padding: 0.75rem 1.5rem; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Create your first Event</a>
    </div>
  `
})
export default class DashboardPage {}
