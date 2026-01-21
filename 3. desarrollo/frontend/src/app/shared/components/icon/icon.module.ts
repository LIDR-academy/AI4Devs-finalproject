import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconPrimaryComponent } from './primary/primary.component';
import { IconSecondaryComponent } from './secondary/secondary.component';
import { MatIconModule } from '@angular/material/icon';

const components = [
  IconPrimaryComponent,
  IconSecondaryComponent,
]

@NgModule({
  declarations: components,
  imports: [CommonModule, MatIconModule],
  exports: components
})
export class IconComponentsModule { }
