import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { TblPrimaryComponent } from './tbl-primary/tbl-primary.component';
import { ButtonComponentsModule } from '../button/button.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


const components = [
  
]

@NgModule({
  declarations: components,
  imports: [TblPrimaryComponent, CommonModule, MatFormFieldModule, MatInputModule, MatTableModule, 
    MatSortModule, MatPaginatorModule, ButtonComponentsModule,
    MatMenuModule, MatIconModule, MatButtonModule,AsyncPipe,
  ],
  exports: components
})
export class TableComponentsModule { }
