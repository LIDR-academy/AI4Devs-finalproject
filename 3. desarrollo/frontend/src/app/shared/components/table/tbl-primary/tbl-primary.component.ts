import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { TblDefaultInterface, TblInterface } from '../tbl.interface';
import { ButtonTyped } from 'app/shared/layout/type';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { ButtonComponentsModule } from '../../button/button.module';

@Component({
  selector: 'tbl-primary',
  templateUrl: './tbl-primary.component.html',
  styleUrl: './tbl-primary.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, ButtonComponentsModule,
    MatMenuModule, MatIconModule, MatButtonModule,
  ]
})
export class TblPrimaryComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() confiTable: TblInterface = TblDefaultInterface;
  //readonly data = inject<TblInterface>(MAT_DIALOG_DATA);
  public columnNames: string[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  @Output() onPagination = new EventEmitter<any>();
  @Output() onCreate = new EventEmitter<{ id: ButtonTyped; label: string; value: any }>();
  @Output() onUpdate = new EventEmitter<{ id: ButtonTyped; label: string; value: any }>();
  @Output() onDelete = new EventEmitter<{ id: ButtonTyped; label: string; value: any }>();
  @Output() onDetail = new EventEmitter<{ id: ButtonTyped; label: string; value: any }>();
  @Output() onButtonClick = new EventEmitter<{ id: ButtonTyped; label: string; value?: any }>();

  constructor(
    private readonly _fuseConfirmation: FuseConfirmationService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    /* @Optional() private dialogRef?: MatDialogRef<TblPrimaryComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any = null, */
  ) {

  }

  ngOnInit(): void {
    console.log("this.confiTable 2");
    // if (this.data) this.confiTable = this.data;
    console.log(this.confiTable);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("this.confiTable");
    console.log(this.confiTable);
    this.columnNames = this.confiTable.header.column.map(c => c.name);
    this._changeDetectorRef.markForCheck();
  }

  ngAfterViewInit(): void {
    this.paginator = this.confiTable.body.source.paginator;
    this.sort = this.confiTable.body.source.sort;
  }

  public createRow(value: any): void {
    this.onCreate.emit({ id: 'create', label: 'Nuevo', value });
  }

  public updateRow(value: any): void {
    this.onUpdate.emit({ id: 'update', label: 'Actualizar', value });
  }

  public async deleteRow(value: any) {
    const dialogRef = this._fuseConfirmation.open({
      title: 'Eliminar Registro',
      message: '¿Está seguro de eliminar el presente registro?',
      actions: {
        confirm: { label: 'Eliminar' },
        cancel: { label: 'Cancelar' }
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirmed') this.onDelete.emit({ id: 'delete', label: 'Eliminar', value });
    });
  }

  public DetailRow(value: any) {
    this.onDetail.emit({ id: 'detail', label: 'Detalle', value });
  }

  public onButtonRow(id: ButtonTyped, label: string, value?: any) {
    this.onButtonClick.emit({ id, label, value });
  }

  public pagination(params: any): void {
    this.onPagination.emit(params);
  }

  public onSearchChange(event: any): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.confiTable.body.source.filter = filterValue.trim().toLowerCase();

    if (this.confiTable.body.source.paginator) {
      this.confiTable.body.source.paginator.firstPage();
    }
  }


}
