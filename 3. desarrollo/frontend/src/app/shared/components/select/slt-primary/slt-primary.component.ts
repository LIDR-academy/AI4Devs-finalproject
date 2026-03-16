import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Optional, Self} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsComponentsModule } from 'app/shared/layout/module/forms.module';

@Component({
  selector: 'slt-primary',
  templateUrl: './slt-primary.component.html',
  styleUrls: ['./slt-primary.component.scss'],
   imports: [CommonModule, MatIconModule, MatInputModule, MatSelectModule, MatOptionModule, FormsComponentsModule],
})
export class SltPrimaryComponent implements OnInit, ControlValueAccessor {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() options: { id: any; label: any }[] = [];

  public currentValue: any = '';
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
    if (this.ngControl) this.control = this.ngControl.control;
  }

  writeValue(value: any): void {
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

  onSelectChange(value: any): void {
    this.currentValue = value;
    this.onTouch();
    this.onChange(value);
  }
  get errorMessage(): string | null {
    if (!this.control || !this.control.errors || !this.control.touched)
      return null;

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
