import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDangerComponent } from './danger/danger.component';
import { ButtonPrimaryComponent } from './primary/primary.component';
import { ButtonSecondaryComponent } from './secondary/secondary.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

const components = [
  ButtonPrimaryComponent,
  ButtonSecondaryComponent,
  ButtonDangerComponent
];

@NgModule({
  declarations: components,
  imports: [CommonModule, MatButtonModule,MatProgressSpinnerModule, MatIconModule, MatTooltipModule],
  exports: components
})
export class ButtonComponentsModule { }
