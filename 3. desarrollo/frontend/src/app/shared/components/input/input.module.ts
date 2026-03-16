import { NgModule } from '@angular/core';
import { PrimaryInputComponent } from './primary/primary.component';
import { SecondaryInputComponent } from './secondary/secondary.component';

const components = [
  PrimaryInputComponent,
  SecondaryInputComponent
]

@NgModule({
  exports: [components],
  imports: [components]
})
export class InputComponentsModule { }
