import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ToficEntity } from '../../domain/entity';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AlertComponentModule, TableComponentsModule, TblDefaultInterface, TblInterface, WrapperComponentsModule } from 'app/shared/components';
import { ApiResponses, ParamsInterface } from 'app/shared/utils';
import { ToficService } from '../../infrastructure/service/service';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { formConfig, tableHeader } from './view.configuration';
import { MatDialog } from '@angular/material/dialog';
import { FrmPrimaryComponent } from 'app/shared/components/forms/frm-primary/frm-primary.component';
import { TblPrimaryComponent } from 'app/shared/components/table/tbl-primary/tbl-primary.component';

@Component({
  selector: 'tofic-view',
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    WrapperComponentsModule,
    TblPrimaryComponent,
    AlertComponentModule
  ],
})

export class ToficViewComponent implements OnInit, OnDestroy {
  public title: string = '';
  private unsubscribeAll: Subject<any> = new Subject<any>();
  public confiTable: TblInterface = TblDefaultInterface;
  public showAlert: boolean = false;
  public alert: { title: string; type: string; message: string } = { title: 'Error', type: 'success', message: '', };

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _service: ToficService,
    private readonly _matDialog: MatDialog,
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.title = this._activatedRoute.snapshot.title;
  }

  ngOnInit(): void {
    this._service.listed$.pipe(takeUntil(this.unsubscribeAll)).subscribe((res: ApiResponses<ToficEntity>) => {
      this.confiTable = {
        ...this.confiTable,
        title: this.title,
        header: { column: tableHeader },
        body: {
          result: res,
          source: new MatTableDataSource(res.data),
        }
      };
      this._changeDetectorRef.markForCheck();
    });
  }

  private findAll(params: ParamsInterface): void {
    this._service.findAll(params).pipe(takeUntil(this.unsubscribeAll)).subscribe((res: ApiResponses<ToficEntity>) => {
      this.confiTable = {
        ...this.confiTable,
        title: this.title,
        header: { column: tableHeader },
        body: {
          result: res,
          source: new MatTableDataSource(res.data),
        }
      };
      this._changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(null);
    this.unsubscribeAll.complete();
  }

  public onCreate(event: any): void {
    const modal = this._matDialog.open(FrmPrimaryComponent, {
      data: { title: event.label, config: formConfig, ismodal: true, value: null }
    });
    modal.afterClosed().subscribe((result: { role: string; title: string, value: ToficEntity }) => {
      if (result !== undefined && result.role === 'confirm' && result.value) {
        this._service.create(result.value).subscribe(() => this._changeDetectorRef.markForCheck())
      }
    });
  }

  public onUpdate(event: any): void {
    const modal = this._matDialog.open(FrmPrimaryComponent, {
      data: { title: event.label, config: formConfig, ismodal: true, value: event.value }
    });
    modal.afterClosed().subscribe((result: { role: string; title: string, value: ToficEntity }) => {
      if (result !== undefined && result.role === 'confirm' && result.value) {
        console.log(result.value)
        this._service.update(result.value.tofic_cod_tofic, result.value).subscribe(() => this._changeDetectorRef.markForCheck())
      }
    });
  }
  public onDelete(event: any): void {
    this._service.delete(event.value.tofic_cod_tofic).subscribe(() => this._changeDetectorRef.markForCheck())
  }

  public onPagination(event: PageEvent): void {
    this.findAll({ page: event.pageIndex + 1, pageSize: event.pageSize, all: '' });
  }


}