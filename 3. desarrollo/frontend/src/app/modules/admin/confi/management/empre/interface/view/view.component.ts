import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { EmpreEntity } from '../../domain/entity';
import { CommonModule } from '@angular/common';
import { EmpreController } from '../../infrastructure/controller/controller';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponentsModule, IconComponentsModule, WrapperComponentsModule } from 'app/shared/components';
import { ApiResponse } from 'app/shared/utils';
import { FormsComponentsModule } from 'app/shared/layout/module/forms.module';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { InputComponentsModule } from 'app/shared/components/input/input.module';

@Component({
  selector: 'empre-view',
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    WrapperComponentsModule,
    ButtonComponentsModule,
    IconComponentsModule,
    FormsComponentsModule,
    InputComponentsModule,
  ],
})

export class EmpreViewComponent implements OnInit, OnDestroy {
  public title: string = '';
  public form_group: UntypedFormGroup;
  private unsubscribe_all: Subject<any> = new Subject<any>();

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _controller: EmpreController,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _formBuilder: UntypedFormBuilder,
    private readonly _fuseConfirmationService: FuseConfirmationService,
  ) {
    this.form_group = this._formBuilder.group({
      empre_nom_empre: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(100)])],
      empre_abr_empre: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      empre_cod_conse: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(3)])],
      empre_cod_empre: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(2)])],
      empre_cta_bce: ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(4)])],
    });
    this.title = this._activatedRoute.snapshot.title;
  }

  ngOnInit(): void {
    this.findAll();
  }

  private findAll(): void {
    this._controller.findAll().pipe(takeUntil(this.unsubscribe_all))
      .subscribe((res: ApiResponse<EmpreEntity>) => {
        this.form_group.setValue(res.data);
        this._changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe_all.next(null);
    this.unsubscribe_all.complete();
  }

  public onClickSave() {
    if (this.form_group.valid) {
      const dialogRef = this._fuseConfirmationService.open({
        title: 'Guardar Cambios',
        message: '¿Estás seguro de que deseas guardar los cambios?',
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result === 'confirmed') {
          this._controller.update(this.form_group.value.empre_cod_empre, this.form_group.value).subscribe(res => {
            this.form_group.setValue(res.data);
            this._changeDetectorRef.markForCheck();
          });
        }
      });
    } else {
      this.form_group.markAllAsTouched();
      this._changeDetectorRef.markForCheck();
      const dialogRef = this._fuseConfirmationService.open({
        title: 'Campos incompletos',
        message: '¿Estás seguro de que deseas guardar los cambios?',
      });
    }

  }

  public onCancel() {
    this.findAll();
  }


}



