import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuseAlertComponent } from '@fuse/components/alert';
import { AlertPrimaryComponent } from './primary/primary.component';
import { fuseAnimations } from '@fuse/animations';
import { MatIconModule } from '@angular/material/icon';

const components = [
  AlertPrimaryComponent
]

@NgModule({
 
  declarations: components,
  imports: [CommonModule, FuseAlertComponent,MatIconModule,],
  exports: components
})
export class AlertComponentModule { }
