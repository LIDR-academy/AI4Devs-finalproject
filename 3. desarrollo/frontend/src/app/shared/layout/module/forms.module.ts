import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const modules = [
  FormsModule,
  ReactiveFormsModule,
];

@NgModule({
  imports: modules,
  exports: modules
})
export class FormsComponentsModule { }
