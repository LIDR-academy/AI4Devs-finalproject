import { NgModule } from '@angular/core';
import { SltSecondaryComponent } from './slt-secondary/slt-secondary.component';
import { SltPrimaryComponent } from './slt-primary/slt-primary.component';
import { FormsComponentsModule } from 'app/shared/layout/module/forms.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

const components = [
  SltPrimaryComponent,
  SltSecondaryComponent
]

@NgModule({
  declarations:[],
  imports: [components],
  exports: [components],
})
export class SelectComponentsModule { }
