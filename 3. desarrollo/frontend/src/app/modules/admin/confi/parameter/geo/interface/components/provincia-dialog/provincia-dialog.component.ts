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
import { CommonModule } from '@angular/common';
import { GeoFacade } from 'app/modules/admin/confi/parameter/geo/application/facades/geo.facade';
import { ProvinciaEntity } from 'app/modules/admin/confi/parameter/geo/domain/entity';

export interface ProvinciaDialogData {
  mode: 'create' | 'edit';
  provincia?: ProvinciaEntity;
}

@Component({
  selector: 'app-provincia-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Crear Provincia' : 'Editar Provincia' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Código SEPS</mat-label>
          <input
            matInput
            formControlName="provi_cod_prov"
            maxlength="2"
            placeholder="01"
          />
          <mat-hint>2 dígitos (ej: 01, 02)</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="provi_nom_provi" />
        </mat-form-field>

        <mat-checkbox formControlName="provi_flg_acti">
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
export class ProvinciaDialogComponent implements OnInit {
  private readonly facade = inject(GeoFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProvinciaDialogComponent>);
  
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ProvinciaDialogData
  ) {
    this.form = this.fb.group({
      provi_cod_prov: ['', [Validators.required, Validators.maxLength(2)]],
      provi_nom_provi: ['', [Validators.required, Validators.maxLength(100)]],
      provi_flg_acti: [true],
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.provincia) {
      this.form.patchValue({
        provi_cod_prov: this.data.provincia.provi_cod_prov,
        provi_nom_provi: this.data.provincia.provi_nom_provi,
        provi_flg_acti: this.data.provincia.provi_flg_acti,
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
          await this.facade.createProvincia(this.form.value);
        } else {
          await this.facade.updateProvincia(
            this.data.provincia!.provi_cod_provi!,
            this.form.value
          );
        }
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error saving provincia:', error);
      }
    }
  }
}

