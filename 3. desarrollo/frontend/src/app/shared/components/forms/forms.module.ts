import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FrmPrimaryComponent } from './frm-primary/frm-primary.component';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { FormsComponentsModule } from 'app/shared/layout/module/forms.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SelectComponentsModule } from '../select/select.module';
import { ButtonComponentsModule } from '../button/button.module';
const components = [
 
]

@NgModule({
  declarations: components,
  imports: [CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    FormsComponentsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIconModule,

    
    FormsModule,
    ReactiveFormsModule,
    SelectComponentsModule,
    ButtonComponentsModule
  ],
  exports: []
})
export class FormComponentsModule { }
