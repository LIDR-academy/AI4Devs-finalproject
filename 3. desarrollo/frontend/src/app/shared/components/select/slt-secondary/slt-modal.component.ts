import { Component, Input, OnInit } from '@angular/core';
import { ButtonComponentsModule } from '../../button/button.module';
import { TableComponentsModule } from '../../table/table.module';


@Component({
  selector: 'slt-secondary-modal',
  imports: [ButtonComponentsModule, TableComponentsModule],
  template: `

  <div class="ion-no-border">
  <div>
    <div slot="start">
      <button (click)="cancelForm()">
        <i slot="icon-only" name="arrow-back-outline"></i>
      </button>
    </div>
    <h2 class="text-sm">{{ data.title }} información</h2>
  </div>
</div>

<div>
  <div class="card">
    <div>
     <tbl-primary [confiTable]="data"
     (onDblClickDetail)="onDblClickDetail($event)"
     (onButtonClick)="confirmForm($event.title, $event.value)"
     (onDetail)="confirmForm($event.title, $event.value)"
     (onCreate)="confirmForm($event.title, $event.value)"
     (onUpdate)="confirmForm($event.title, $event.value)"
     (onDelete)="confirmForm($event.title, $event.value)" 
     />
    </div>
  </div>
</div>

<div class="ion-no-border">
  <div class="gap-2 px-2">
    <div class="d-flex gap-1 float-end">
      <btn-secondary
        (click)="cancelForm()"
        label="Cancelar"
        backgroundColor="primary"
        mode="secondary"
        icon="fa-solid fa-rectangle-xmark"
      />
    </div>
  </div>
</div>

  `,

})
export class SltModalSecondaryComponent {
  @Input() id: string = '';
  @Input() label: string = '';
  @Input() placeholder: string = 'Seleccione una opción';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() options: { id: any; value: any }[] = [];
  @Input() data: any = {
    title: '',
    header: [],
    body: {
      data: [],
      filter: [],
    },
    actions: {
      create: false,
      update: false,
      delete: false,
      detail: false,
      dblclick: true,
      buttons: []
    },
  };

  constructor() {

  }


  public onDblClickDetail(event: any) {
    this.confirmForm(event.title, event.value);
  }

  public cancelForm(): void {
    this.confirmForm('cancel', null);
  }

  public confirmForm(title: string, value: any): void {
    //this.modalController.dismiss(value, title);
  }



}
