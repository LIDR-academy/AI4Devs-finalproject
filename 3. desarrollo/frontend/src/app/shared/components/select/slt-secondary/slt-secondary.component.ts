import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Optional, Output, Self } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { TblDefaultInterface, TblInterface } from '../../table/tbl.interface';
import { CommonModule } from '@angular/common';
import { MatError } from '@angular/material/form-field';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsComponentsModule } from 'app/shared/layout/module/forms.module';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { TblPrimaryComponent } from '../../table/tbl-primary/tbl-primary.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'slt-secondary',
  templateUrl: './slt-secondary.component.html',
  styleUrls: ['./slt-secondary.component.scss'],
  imports: [CommonModule, MatIconModule, MatInputModule, MatSelectModule, MatOptionModule, FormsComponentsModule],
})
export class SltSecondaryComponent implements OnInit {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() options: { id: any; label: string }[] = [];
  @Input() data?: TblInterface = TblDefaultInterface;

  @Output() onModalAction = new EventEmitter<{ title: string, value: any }>();
  @Output() onChangeAction = new EventEmitter<string>();

  public currentValue: any = '';
  public onChange = (_: any) => { };
  public onTouch = () => { };
  public isDisabled: boolean = false;

  control: AbstractControl | null = null;

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    // Inyecta NgControl para registrar el ControlValueAccessor
    @Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    console.log(this.options);
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
    this.onChangeAction.emit(value);
    this.onTouch();
    this.onChange(value);
  }

  async selectModal() {
    console.log("this.data");
    console.log(this.data);
    const modal = this._matDialog.open(TblPrimaryComponent, {
      //data: { data: this.data, }
    });
    this._changeDetectorRef.markForCheck();
    modal.afterClosed().subscribe((result: { role: string; title: string; value: any }) => {
      if (result !== undefined && result.role === 'confirm' && result.value) {
        console.log(result);
      }
    });
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


  searchText: string = '';
  filteredOptions: { id: any; label: string }[] = [];


  onInputChange() {
    const text = this.searchText.toLowerCase();
    this.filteredOptions = this.options.filter(option =>
      option.label.toLowerCase().includes(text)
    );
  }

  selectOption(option: any) {
    this.searchText = option.label;
    this.currentValue = option.id;
    this.filteredOptions = [];

    // Si necesitas emitir el cambio manualmente
    this.onSelectChange(option.id);
  }

  onHover() {
    if (this.searchText.trim() === '') {
      this.filteredOptions = this.options;
    }
  }

  onBlur() {
    if (this.searchText.trim() === '') {
      this.filteredOptions = [];  // Cerrar la lista si el input está vacío
    }
  }
  alert(label: string) {
    alert('Button clicked!');
  }

}
