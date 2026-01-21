import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthFacade } from '../../../application/facades/auth.facade';
import { UserEntity, OfficeEntity } from '../../../domain/entities';
import { Subscription } from 'rxjs';

/**
 * Componente para selección de oficina
 * Se muestra cuando el usuario necesita seleccionar una oficina antes de continuar
 * (contadores o usuarios con múltiples oficinas)
 */
@Component({
  selector: 'app-select-office',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './select-office.component.html',
  styleUrls: ['./select-office.component.scss'],
})
export class SelectOfficeComponent implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private subscriptions: Subscription[] = [];

  selectOfficeForm: FormGroup;
  user: UserEntity | null = null;
  offices: OfficeEntity[] = [];
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToFacade();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.selectOfficeForm = this.formBuilder.group({
      officeId: ['', [Validators.required]],
    });
  }

  private subscribeToFacade(): void {
    this.subscriptions.push(
      this.authFacade.user$.subscribe((user) => {
        this.user = user;
        if (user) {
          this.offices = user.oficinasPermitidas || [];
          // Seleccionar la última oficina usada o la primera por defecto
          const defaultOfficeId = user.oficinaId || (this.offices.length > 0 ? this.offices[0].id : null);
          if (defaultOfficeId) {
            this.selectOfficeForm.patchValue({ officeId: defaultOfficeId });
          }
        }
      })
    );

    this.subscriptions.push(
      this.authFacade.isLoading$.subscribe((loading) => {
        this.isLoading = loading;
        if (loading) {
          this.selectOfficeForm.disable();
        } else {
          this.selectOfficeForm.enable();
        }
      })
    );

    this.subscriptions.push(
      this.authFacade.error$.subscribe((error) => {
        this.error = error;
      })
    );
  }

  /**
   * Continúa con la oficina seleccionada
   */
  async onContinue(): Promise<void> {
    if (this.selectOfficeForm.invalid) {
      this.selectOfficeForm.markAllAsTouched();
      return;
    }

    try {
      const officeId = this.selectOfficeForm.value.officeId;
      await this.authFacade.selectOffice(officeId);
      // El facade maneja la redirección
    } catch (error: any) {
      // El error ya está manejado por el facade
    }
  }

  /**
   * Cierra la sesión
   */
  async onLogout(): Promise<void> {
    await this.authFacade.logout();
  }

  /**
   * Obtiene el nombre completo de la oficina
   */
  getOfficeDisplay(office: OfficeEntity): string {
    return office.getDescripcionCompleta();
  }
}

