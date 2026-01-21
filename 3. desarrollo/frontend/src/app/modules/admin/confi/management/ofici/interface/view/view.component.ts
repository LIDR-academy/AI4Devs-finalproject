import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { OficiEntity } from '../../domain/entity';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AlertComponentModule, TblDefaultInterface, TblInterface, WrapperComponentsModule } from 'app/shared/components';
import { ApiResponses, ParamsDefaultInterface, ParamsInterface } from 'app/shared/utils';
import { OficiService } from '../../infrastructure/service/service';
import { EmpreController } from '../../../empre/infrastructure/controller/controller';
import { AfterViewInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { formConfig, tableHeader, tableHeaderTofic } from './view.configuration';
import { MatDialog } from '@angular/material/dialog';
import { FrmPrimaryComponent } from 'app/shared/components/forms/frm-primary/frm-primary.component';
import { ToficService } from 'app/modules/admin/confi/parameter/tofici/infrastructure/service/service';
import { FormInterface } from 'app/shared/components/forms/form.interface';
import { ToficEntity } from 'app/modules/admin/confi/parameter/tofici/domain/entity';
import { EmpreEntity } from '../../../empre/domain/entity';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TblPrimaryComponent } from 'app/shared/components/table/tbl-primary/tbl-primary.component';

@Component({
  selector: 'ofici-view',
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

export class OficiViewComponent implements OnInit, OnDestroy {
  public title: string = '';
  private unsubscribeAll: Subject<any> = new Subject<any>();
  public confiTable: TblInterface = TblDefaultInterface;
  public showAlert: boolean = false;
  public alert: { title: string; type: string; message: string } = { title: 'Error', type: 'success', message: '', };
  public empre: EmpreEntity;

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _service: OficiService,
    private readonly _serviceTofic: ToficService,
    private readonly _matDialog: MatDialog,
    private readonly _serviceEmpre: EmpreController,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _fuseConfirmation: FuseConfirmationService,
  ) {
    this.title = this._activatedRoute.snapshot.title;
  }

  ngOnInit(): void {
    this._serviceEmpre.get$.pipe(takeUntil(this.unsubscribeAll)).subscribe(res => {
      this.empre = res;
      const ofici_cod_empre = formConfig.find((f: FormInterface) => f.name === 'ofici_cod_empre');
      if (ofici_cod_empre) {
        ofici_cod_empre.options = [{ id: res.empre_cod_empre, label: res.empre_nom_empre }];
        ofici_cod_empre.value = res.empre_cod_empre;
      }
      this.findAll(ParamsDefaultInterface);
      this._changeDetectorRef.markForCheck();
    });
  }

  private findAll(params: ParamsInterface): void {
    this._serviceEmpre.get$.pipe(
      takeUntil(this.unsubscribeAll),
      switchMap(res =>
        this._service.findAll({ ...params, id_empre: res.empre_cod_empre })
      )
    ).subscribe((res: ApiResponses<OficiEntity>) => {
      this.confiTable = {
        ...this.confiTable,
        title: "",
        header: {
          column: tableHeader,
        },
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


  private loadToficOptions(): void {
    const ofici_cod_tofic = formConfig.find((f: FormInterface) => f.name === 'ofici_cod_tofic');
    this._serviceTofic.listed$.pipe(takeUntil(this.unsubscribeAll)).subscribe((res: ApiResponses<ToficEntity>) => {
      if (ofici_cod_tofic) {
        ofici_cod_tofic.options = res.data.map((r) => ({ id: r.tofic_cod_tofic, label: r.tofic_des_tofic }));
        ofici_cod_tofic.data = {
          ...this.confiTable,
          title: "",
          header: {
            column: tableHeaderTofic,
          },
          body: {
            result: res,
            source: new MatTableDataSource(res.data),
          }
        };
      }
      this._changeDetectorRef.markForCheck();

    });
  }

  public onCreate(event: any): void {
    this.loadToficOptions();
    const modal = this._matDialog.open(FrmPrimaryComponent, {
      data: { title: event.label, config: formConfig, ismodal: true, value: null }
    });
    modal.afterClosed().subscribe((result: { role: string; title: string; value: OficiEntity }) => {
      if (result !== undefined && result.role === 'confirm' && result.value) {
        console.log
        this._service.create({ ...result.value, ofici_cod_empre: this.empre.empre_cod_empre, }).subscribe({
          next: () => this._changeDetectorRef.markForCheck(),
          error: ({ title, message }) => {
            this._fuseConfirmation.open({ title, message, actions: { confirm: { label: 'Aceptar' } } });
            this._changeDetectorRef.markForCheck();
          }
        });
      }
    });
  }

  public onUpdate(event: any): void {
    this.loadToficOptions();
    const modal = this._matDialog.open(FrmPrimaryComponent, {
      data: { title: event.label, config: formConfig, ismodal: true, value: event.value }
    });
    modal.afterClosed().subscribe((result: { role: string; title: string; value: OficiEntity }) => {
      if (result !== undefined && result.role === 'confirm' && result.value) {
        this._service.update(result.value.ofici_cod_ofici, { ...result.value, ofici_cod_empre: this.empre.empre_cod_empre, }).subscribe({
          next: () => this._changeDetectorRef.markForCheck(),
          error: ({ title, message }) => {
            this._fuseConfirmation.open({ title, message, actions: { confirm: { label: 'Aceptar' } } });
            this._changeDetectorRef.markForCheck();
          }
        });
      }
    });
  }

  public onDelete(event: any): void {
    this._service.delete(event.value.ofici_cod_ofici).subscribe(() => this._changeDetectorRef.markForCheck());
  }

  public onPagination(event: PageEvent): void {
    this.findAll({ page: event.pageIndex + 1, pageSize: event.pageSize, all: '' });
  }
}