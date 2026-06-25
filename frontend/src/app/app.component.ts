import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 class="text-4xl text-primary font-heading mb-4">Aura Planning</h1>
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  title = 'aura-frontend';
}
