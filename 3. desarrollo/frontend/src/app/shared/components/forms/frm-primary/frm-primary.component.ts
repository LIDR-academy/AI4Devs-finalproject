import { Component, EventEmitter, inject, Input, model, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormInterface } from '../form.interface';
import { Subject } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InputComponentsModule } from '../../input/input.module';
import { SelectComponentsModule } from '../../select/select.module';
import { ButtonComponentsModule } from "../../button/button.module";


@Component({
  selector: 'frm-primary',
  templateUrl: './frm-primary.component.html',
  styleUrl: './frm-primary.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    InputComponentsModule,
    SelectComponentsModule,
    ButtonComponentsModule
],
})
export class FrmPrimaryComponent implements OnInit {

  @Input() title: 'Nuevo' | 'Actualizar' = 'Nuevo';
  @Input() formReadySubject?: Subject<FormGroup>;
  @Output() onSubmit = new EventEmitter<{ value: any; status: string }>(); // Evento al enviar el formulario
  @Output() onCancel = new EventEmitter<void>(); // Evento al cancelar el formulario
  @Output() onModalAction = new EventEmitter<{ title: string, value: any }>();

  readonly data = inject<{ title: string; config: FormInterface[]; ismodal: boolean; value: any }>(MAT_DIALOG_DATA);
  /**
   *
   * Formulario reactivo generado dinámicamente.
   */
  public form: UntypedFormGroup;


  /**
   * Constructor
   */
  constructor(
    public _matDialogRef: MatDialogRef<FrmPrimaryComponent>,
    private _formBuilder: UntypedFormBuilder,
    //private modalController: ModalController
  ) {
    this.form = this._formBuilder.group({});
  }

  ngOnInit(): void {

    this.buildForm();
    if (this.data.value) this.form.patchValue(this.data.value);
    if (this.formReadySubject) this.formReadySubject.next(this.form);

  }

  /**
   * buildForm
   * Construye dinámicamente el formulario basado en la configuración `config`.
   */
  private buildForm(): void {
    const defaultFields: FormInterface[] = [];

    // Combinamos config existente con campos por defecto (sin mutar)
    const fields: FormInterface[] = [
      ...defaultFields,
      ...(this.data.config || []),
    ];

    // Creamos los controles con reduce
    const formControls = fields.reduce((acc, field) => {
      const validations = this.mapValidations(field.validations || []);
      acc[field.name] = this._formBuilder.control(
        { value: field.value ?? '', disabled: field.disabled || false }, // Soporta 0, false, etc.
        validations
      );
      return acc;
    }, {} as { [key: string]: AbstractControl });

    this.form = this._formBuilder.group(formControls);
  }

  /**
   * mapValidations
   * Convierte las validaciones configuradas en la estructura utilizada por Angular.
   * @param validations Lista de validaciones configuradas
   * @returns Array de validaciones compatibles con Angular
   */
  private mapValidations(validations: any[] = []): any[] {
    return validations
      .map((validation) => {
        switch (validation.type) {
          case 'required':
            return Validators.required;
          case 'minLength':
            return Validators.minLength(validation.value);
          case 'maxLength':
            return Validators.maxLength(validation.value);
          case 'email':
            return Validators.email;
          case 'pattern':
            return Validators.pattern(validation.value);
          case 'min':
            return Validators.min(validation.value);
          case 'max':
            return Validators.max(validation.value);
          default:
            return null;
        }
      })
      .filter((v) => v !== null); // Filtra valores nulos
  }

  /**
   * getErrorMessage
   * Obtiene el mensaje de error correspondiente al primer error en un campo específico.
   * @param fieldName Nombre del campo en el formulario.
   * @returns Mensaje de error o null si no hay errores.
   */
  public getErrorMessage(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (control?.touched && control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      const fieldConfig = this.data.config.find((field) => field.name === fieldName);
      const error = fieldConfig?.validations?.find((v) => v.type === errorKey);
      return error?.message || null;
    }
    return null;
  }

  /**
   * onSubmit
   * Envía los valores del formulario si es válido, o muestra un mensaje de error.
   */
  public submitForm(): void {
    console.log(this.form.value);
    if (this.form.valid) {
      const submit = { value: this.form.value, status: this.title };
      if (this.data.ismodal) this._matDialogRef.close({ role: 'confirm', title: this.title, value: this.form.value });
      else this.onSubmit.emit(submit);
    } else {
      console.error('Formulario inválido. Por favor revise los campos.');
    }
  }
  /**
   * Cancela el formulario.
   */
  public cancelForm(): void {
    this.form.reset();
    if (this.data.ismodal) this._matDialogRef.close({ role: 'cancel', title: this.title, value: null });
    else this.onCancel.emit();
  }

  /**
   * Regresar información selecionada formulario.
   */
  public onSelectModelAction(event: any) {
    setTimeout(() => {
      if (this.data.ismodal) this._matDialogRef.close({ role: 'confirm', title: this.title, value: this.form.value });
      else this.onCancel.emit(event);
    }, 500);
  }


  /**
   * isFieldValid
   * Verifica si un campo es válido.
   * @param fieldName Nombre del campo en el formulario.
   * @returns `true` si el campo es válido, de lo contrario `false`.
   */
  public isFieldValid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return control?.valid || false;
  }

}
