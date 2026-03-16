import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { GeoFacade } from 'app/modules/admin/confi/parameter/geo/application/facades/geo.facade';
import {
  ParroquiaEntity,
  CantonEntity,
  ProvinciaEntity,
} from 'app/modules/admin/confi/parameter/geo/domain/entity';

export interface ParroquiaDialogData {
  mode: 'create' | 'edit';
  parroquia?: ParroquiaEntity;
  canton?: CantonEntity;
  provincia?: ProvinciaEntity;
}

@Component({
  selector: 'app-parroquia-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Crear Parroquia' : 'Editar Parroquia' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Cantón</mat-label>
          <input
            matInput
            [value]="data.canton?.canto_nom_canto || 'N/A'"
            disabled
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Código SEPS</mat-label>
          <input
            matInput
            formControlName="parro_cod_parr"
            maxlength="2"
            placeholder="01"
          />
          <mat-hint>2 dígitos (ej: 01, 50)</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="parro_nom_parro" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Tipo de Área</mat-label>
          <mat-select formControlName="parro_tip_area">
            <mat-option [value]="null">No especificado</mat-option>
            <mat-option value="U">Urbana</mat-option>
            <mat-option value="R">Rural</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-checkbox formControlName="parro_flg_acti">
          Activo
        </mat-checkbox>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="form.invalid"
        (click)="onSave()"
      >
        {{ data.mode === 'create' ? 'Crear' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ParroquiaDialogComponent implements OnInit {
  private readonly facade = inject(GeoFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ParroquiaDialogComponent>);
  
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ParroquiaDialogData
  ) {
    this.form = this.fb.group({
      canto_cod_canto: [
        data.canton?.canto_cod_canto || null,
        [Validators.required],
      ],
      parro_cod_parr: ['', [Validators.required, Validators.maxLength(2)]],
      parro_nom_parro: ['', [Validators.required, Validators.maxLength(120)]],
      parro_tip_area: [null],
      parro_flg_acti: [true],
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.parroquia) {
      this.form.patchValue({
        canto_cod_canto: this.data.parroquia.canto_cod_canto,
        parro_cod_parr: this.data.parroquia.parro_cod_parr,
        parro_nom_parro: this.data.parroquia.parro_nom_parro,
        parro_tip_area: this.data.parroquia.parro_tip_area,
        parro_flg_acti: this.data.parroquia.parro_flg_acti,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onSave(): Promise<void> {
    if (this.form.valid) {
      try {
        if (this.data.mode === 'create') {
          await this.facade.createParroquia(this.form.value);
        } else {
          await this.facade.updateParroquia(
            this.data.parroquia!.parro_cod_parro!,
            this.form.value
          );
        }
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error saving parroquia:', error);
      }
    }
  }
}

