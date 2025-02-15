import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapaComponent } from './mapa/mapa.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MapaComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
}
