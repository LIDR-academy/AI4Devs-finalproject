import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Optional, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatError, MatInputModule } from '@angular/material/input';
import { FormsComponentsModule } from 'app/shared/layout/module/forms.module';


@Component({
  selector: 'ipt-primary',
  templateUrl: './primary.component.html',
  styleUrl: './primary.component.scss',
  imports: [CommonModule, MatIconModule,MatFormFieldModule, MatInputModule, MatError, MatIcon, FormsComponentsModule],
})
export class PrimaryInputComponent implements OnInit, ControlValueAccessor {

  @Input() id: string = '';
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = 'Ingrese la información solicitada';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() minLength: number = 1000;
  @Input() maxLength: number = 1000;
  @Input() currentValue: any = '';
  
  public onChange = (_: any) => { };
  public onTouch = () => { };
  public isDisabled: boolean = false;

  control: AbstractControl | null = null;

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (this.ngControl) {
      this.control = this.ngControl.control;
    }
  }

  writeValue(value: number): void {
    this.currentValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInputChange(event: any): void {
    this.currentValue = event.target.value;
    this.onTouch();
    this.onChange(this.currentValue);
  }

  get errorMessage(): string | null {
    if (!this.control || !this.control.errors || !this.control.touched) return null;

    const errors = this.control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Correo electrónico no válido';
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      const actualLength = errors['minlength'].actualLength;
      return `Debe tener al menos ${requiredLength} caracteres (actual: ${actualLength})`;
    }
    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `Debe tener como máximo ${requiredLength} caracteres`;
    }
    if (errors['pattern']) return 'El formato no es válido';
    if (errors['min']) {
      return `El valor mínimo permitido es ${errors['min'].min}`;
    }
    if (errors['max']) {
      return `El valor máximo permitido es ${errors['max'].max}`;
    }
    if (errors['match']) return 'Los valores no coinciden';
    if (errors['custom']) return errors['custom']; // Mensaje definido manualmente en validadores personalizados

    return 'Campo inválido';
  }

} 