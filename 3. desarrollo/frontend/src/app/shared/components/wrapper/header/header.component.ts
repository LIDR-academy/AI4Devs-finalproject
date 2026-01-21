import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HeaderWrapperButtonInterface } from './header.component.config';
import { ButtonTyped } from 'app/shared/layout/type';

@Component({
  selector: 'header-wrapper',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderWrapperComponent {

  @Input() title: string = '';
  @Input() subtitle: string = 'Cooperativa de ahorro y credito ';
  @Input() buttons: HeaderWrapperButtonInterface[] = [];

  @Output() onClickButton = new EventEmitter<{ id: ButtonTyped, label: string }>();

  public onButtonRow(id: ButtonTyped, label: string) {
    this.onClickButton.emit({ id, label });
  }
}
