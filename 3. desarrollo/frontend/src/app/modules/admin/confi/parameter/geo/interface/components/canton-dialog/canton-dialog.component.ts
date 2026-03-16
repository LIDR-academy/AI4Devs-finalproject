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
import { CantonEntity, ProvinciaEntity } from 'app/modules/admin/confi/parameter/geo/domain/entity';

export interface CantonDialogData {
  mode: 'create' | 'edit';
  canton?: CantonEntity;
  provincia?: ProvinciaEntity;
}

@Component({
  selector: 'app-canton-dialog',
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
      {{ data.mode === 'create' ? 'Crear Cantón' : 'Editar Cantón' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Provincia</mat-label>
          <input
            matInput
            [value]="data.provincia?.provi_nom_provi || 'N/A'"
            disabled
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Código SEPS</mat-label>
          <input
            matInput
            formControlName="canto_cod_cant"
            maxlength="2"
            placeholder="01"
          />
          <mat-hint>2 dígitos (ej: 01, 02)</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="canto_nom_canto" />
        </mat-form-field>

        <mat-checkbox formControlName="canto_flg_acti">
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
export class CantonDialogComponent implements OnInit {
  private readonly facade = inject(GeoFacade);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CantonDialogComponent>);
  
  form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CantonDialogData
  ) {
    this.form = this.fb.group({
      provi_cod_provi: [
        data.provincia?.provi_cod_provi || null,
        [Validators.required],
      ],
      canto_cod_cant: ['', [Validators.required, Validators.maxLength(2)]],
      canto_nom_canto: ['', [Validators.required, Validators.maxLength(100)]],
      canto_flg_acti: [true],
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.canton) {
      this.form.patchValue({
        provi_cod_provi: this.data.canton.provi_cod_provi,
        canto_cod_cant: this.data.canton.canto_cod_cant,
        canto_nom_canto: this.data.canton.canto_nom_canto,
        canto_flg_acti: this.data.canton.canto_flg_acti,
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
          await this.facade.createCanton(this.form.value);
        } else {
          await this.facade.updateCanton(
            this.data.canton!.canto_cod_canto!,
            this.form.value
          );
        }
        this.dialogRef.close(true);
      } catch (error) {
        console.error('Error saving canton:', error);
      }
    }
  }
}

