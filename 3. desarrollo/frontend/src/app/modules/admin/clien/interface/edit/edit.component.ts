import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { ClienFacade } from 'app/modules/admin/confi/management/clien/application/facades/clien.facade';
import { ClienEnum } from 'app/modules/admin/confi/management/clien/infrastructure/enum/enum';
import { RegistrarClienteCompletoRequestDto } from 'app/modules/admin/confi/management/clien/infrastructure/dto/request/registrar-cliente-completo.request.dto';
import { CatalogService } from 'app/modules/admin/confi/management/clien/infrastructure/services/catalog.service';
import { GeoFacade } from 'app/modules/admin/confi/parameter/geo/application/facades/geo.facade';
import { CiiuFacade } from 'app/modules/admin/confi/parameter/ciiu/application/facades/ciiu.facade';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from 'app/modules/admin/confi/parameter/geo/domain/entity';
import { ActividadCompletaEntity } from 'app/modules/admin/confi/parameter/ciiu/domain/entity';

/**
 * Componente para editar un cliente completo existente
 * Similar al componente de creación pero carga datos existentes
 */
@Component({
  selector: 'app-clien-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
  ],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienEditComponent implements OnInit {
  readonly facade = inject(ClienFacade);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly catalogService = inject(CatalogService);
  private readonly geoFacade = inject(GeoFacade);
  private readonly ciiuFacade = inject(CiiuFacade);

  // Exposed signals
  readonly loading = this.facade.loadingCompleto;
  readonly clienteCompleto = this.facade.clienteCompleto;

  // Form groups (mismos que en create)
  formPersona!: FormGroup;
  formCliente!: FormGroup;
  formDomicilio!: FormGroup;
  formActividadEconomica!: FormGroup;
  formRepresentante!: FormGroup;
  formConyuge!: FormGroup;
  formInformacionLaboral!: FormGroup;
  formReferencias: FormGroup[] = [];
  formInformacionFinanciera: FormGroup[] = [];
  formUsuarioBancaDigital!: FormGroup;
  formBeneficiarios: FormGroup[] = [];
  formResidenciaFiscal!: FormGroup;
  formAsamblea!: FormGroup;

  // Flags
  showRepresentante = false;
  showConyuge = false;
  showInformacionLaboral = false;
  showReferencias = false;
  showInformacionFinanciera = false;
  showUsuarioBancaDigital = false;
  showBeneficiarios = false;
  showResidenciaFiscal = false;
  showAsamblea = false;

  clienteId!: number;

  // Catálogos (igual que en create)
  readonly oficinas = this.catalogService.oficinas;
  readonly tiposPersona = this.catalogService.tiposPersona;
  readonly tiposIdentificacion = this.catalogService.tiposIdentificacion;
  readonly sexos = this.catalogService.sexos;
  readonly nacionalidades = this.catalogService.nacionalidades;
  readonly nivelesInstruccion = this.catalogService.nivelesInstruccion;
  readonly provincias = this.geoFacade.provinciasFiltradas;
  readonly cantones = this.geoFacade.cantonesFiltrados;
  readonly parroquias = this.geoFacade.parroquiasFiltradas;
  readonly actividadesCiiu = this.ciiuFacade.actividades;

  // Estados de carga
  readonly loadingCatalogs = this.catalogService.loadingOficinas;
  readonly loadingProvincias = this.geoFacade.loading;
  readonly loadingCantones = this.geoFacade.loadingCantones;
  readonly loadingParroquias = this.geoFacade.loadingParroquias;
  readonly loadingCiiu = this.ciiuFacade.loading;

  // Selecciones GEO
  selectedProvincia: ProvinciaEntity | null = null;
  selectedCanton: CantonEntity | null = null;

  ngOnInit(): void {
    this.clienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.initForms();
    this.loadCatalogs();
    this.loadClienteCompleto();
  }

  /**
   * Carga todos los catálogos necesarios
   */
  async loadCatalogs(): Promise<void> {
    await this.catalogService.loadAllCatalogs();
    await this.geoFacade.loadProvincias();
  }

  /**
   * Busca actividades económicas CIIU
   */
  async onSearchCiiu(query: string): Promise<void> {
    if (query && query.length >= 3) {
      await this.ciiuFacade.searchActividades(query, 20);
    }
  }

  /**
   * Selecciona una actividad CIIU
   */
  onSelectActividad(actividad: ActividadCompletaEntity): void {
    // Usar la abreviatura de la actividad como código BCE
    this.formActividadEconomica.patchValue({
      cleco_cod_aebce: actividad.ciact_abr_ciact,
    });
  }

  /**
   * Inicializa todos los formularios (igual que en create)
   */
  initForms(): void {
    // Reutilizar la misma lógica de create
    // TODO: Extraer a un método compartido o servicio
    this.formPersona = this.fb.group({
      perso_cod_tpers: [1, Validators.required],
      perso_cod_tiden: [1, Validators.required],
      perso_ide_perso: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
      perso_nom_perso: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      perso_fec_inici: [null],
      perso_cod_sexos: [null],
      perso_cod_nacio: [null],
      perso_cod_instr: [null],
      perso_ema_perso: ['', Validators.email],
      perso_tel_perso: [''],
      perso_cel_perso: [''],
      created_by: [1],
      updated_by: [1],
    });

    this.formCliente = this.fb.group({
      clien_cod_ofici: [null, Validators.required],
      clien_ctr_socio: [false, Validators.required],
      clien_fec_ingin: [new Date(), Validators.required],
      clien_fec_salid: [null],
      clien_des_obser: [''],
      created_by: [1],
      updated_by: [1],
    });

    // ... resto de formularios igual que en create
    // Por brevedad, solo muestro los principales
    this.formDomicilio = this.fb.group({
      cldom_cod_provi: [null, Validators.required],
      cldom_cod_canto: [null, Validators.required],
      cldom_cod_parro: [null, Validators.required],
      cldom_dir_domic: ['', Validators.required],
      cldom_tel_domic: [''],
      cldom_ref_domic: [''],
      cldom_lat_domic: [null],
      cldom_lon_domic: [null],
      created_by: [1],
      updated_by: [1],
    });

    this.formActividadEconomica = this.fb.group({
      cleco_cod_aebce: ['', Validators.required],
      created_by: [1],
      updated_by: [1],
    });

    // Inicializar formularios opcionales
    this.formRepresentante = this.fb.group({
      clrep_cod_perso: [null, Validators.required],
      clrep_cod_tirep: [null, Validators.required],
      created_by: [1],
      updated_by: [1],
    });

    this.formConyuge = this.fb.group({
      clcyg_cod_perso: [null, Validators.required],
      created_by: [1],
      updated_by: [1],
    });

    this.formInformacionLaboral = this.fb.group({
      cllab_cod_clab: [null, Validators.required],
      cllab_cod_empre: [null],
      cllab_des_cargo: [''],
      cllab_val_ingre: [null],
      cllab_fec_ingre: [null],
      created_by: [1],
      updated_by: [1],
    });

    this.formUsuarioBancaDigital = this.fb.group({
      clbnc_usr_banca: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      clbnc_pwd_banca: ['', [Validators.required, Validators.minLength(8)]],
      clbnc_tel_banca: [''],
      clbnc_ema_banca: ['', Validators.email],
      clbnc_lat_banca: [null],
      clbnc_lon_banca: [null],
      clbnc_lim_retir: [null],
      clbnc_lim_trans: [null],
      created_by: [1],
      updated_by: [1],
    });

    this.formResidenciaFiscal = this.fb.group({
      clrfi_cod_pais: [null],
      clrfi_num_tin: [''],
      clrfi_ctr_crs: [false],
      clrfi_ctr_fatca: [false],
      created_by: [1],
      updated_by: [1],
    });

    this.formAsamblea = this.fb.group({
      clasm_fec_rasam: [null],
      clasm_ctr_direc: [false],
      clasm_fec_direc: [null],
      created_by: [1],
      updated_by: [1],
    });
  }

  /**
   * Carga los datos del cliente completo
   */
  async loadClienteCompleto(): Promise<void> {
    try {
      const cliente = await this.facade.getClienteCompletoById(this.clienteId);
      this.populateForms(cliente);
    } catch (error: any) {
      this.snackBar.open(
        error?.message || ClienEnum.messages.loadError,
        'Cerrar',
        { duration: 5000 }
      );
      this.router.navigate([ClienEnum.routeList]);
    }
  }

  /**
   * Pobla los formularios con los datos del cliente
   */
  populateForms(cliente: any): void {
    // Persona
    if (cliente.persona) {
      this.formPersona.patchValue(cliente.persona);
    }

    // Cliente
    if (cliente.cliente) {
      this.formCliente.patchValue(cliente.cliente);
    }

    // Domicilio
    if (cliente.domicilio) {
      this.formDomicilio.patchValue(cliente.domicilio);
    }

    // Actividad Económica
    if (cliente.actividadEconomica) {
      this.formActividadEconomica.patchValue(cliente.actividadEconomica);
    }

    // Representante
    if (cliente.representante) {
      this.showRepresentante = true;
      this.formRepresentante.patchValue(cliente.representante);
    }

    // Cónyuge
    if (cliente.conyuge) {
      this.showConyuge = true;
      this.formConyuge.patchValue(cliente.conyuge);
    }

    // Información Laboral
    if (cliente.informacionLaboral) {
      this.showInformacionLaboral = true;
      this.formInformacionLaboral.patchValue(cliente.informacionLaboral);
    }

    // Referencias
    if (cliente.referencias && cliente.referencias.length > 0) {
      this.showReferencias = true;
      cliente.referencias.forEach((ref: any) => {
        const formRef = this.fb.group({
          clref_cod_perso: [ref.clref_cod_perso, Validators.required],
          clref_cod_tiref: [ref.clref_cod_tiref, Validators.required],
          clref_num_cuenta: [ref.clref_num_cuenta],
          clref_val_saldo: [ref.clref_val_saldo],
          created_by: [1],
          updated_by: [1],
        });
        this.formReferencias.push(formRef);
      });
    }

    // Información Financiera
    if (cliente.informacionFinanciera && cliente.informacionFinanciera.length > 0) {
      this.showInformacionFinanciera = true;
      cliente.informacionFinanciera.forEach((fin: any) => {
        const formFin = this.fb.group({
          clfin_cod_tifin: [fin.clfin_cod_tifin, Validators.required],
          clfin_cod_ifina: [fin.clfin_cod_ifina],
          clfin_val_monto: [fin.clfin_val_monto, Validators.required],
          clfin_des_obser: [fin.clfin_des_obser],
          created_by: [1],
          updated_by: [1],
        });
        this.formInformacionFinanciera.push(formFin);
      });
    }

    // Usuario Banca Digital
    if (cliente.usuarioBancaDigital) {
      this.showUsuarioBancaDigital = true;
      this.formUsuarioBancaDigital.patchValue(cliente.usuarioBancaDigital);
    }

    // Beneficiarios
    if (cliente.beneficiarios && cliente.beneficiarios.length > 0) {
      this.showBeneficiarios = true;
      cliente.beneficiarios.forEach((ben: any) => {
        const formBen = this.fb.group({
          clben_cod_perso: [ben.clben_cod_perso, Validators.required],
          clben_num_porce: [ben.clben_num_porce, Validators.required],
          created_by: [1],
          updated_by: [1],
        });
        this.formBeneficiarios.push(formBen);
      });
    }

    // Residencia Fiscal
    if (cliente.residenciaFiscal) {
      this.showResidenciaFiscal = true;
      this.formResidenciaFiscal.patchValue(cliente.residenciaFiscal);
    }

    // Asamblea
    if (cliente.asamblea) {
      this.showAsamblea = true;
      this.formAsamblea.patchValue(cliente.asamblea);
    }
  }

  /**
   * Métodos auxiliares (igual que en create)
   */
  addReferencia(): void {
    const formRef = this.fb.group({
      clref_cod_perso: [null, Validators.required],
      clref_cod_tiref: [null, Validators.required],
      clref_num_cuenta: [''],
      clref_val_saldo: [null],
      created_by: [1],
      updated_by: [1],
    });
    this.formReferencias.push(formRef);
    this.showReferencias = true;
  }

  removeReferencia(index: number): void {
    this.formReferencias.splice(index, 1);
    if (this.formReferencias.length === 0) {
      this.showReferencias = false;
    }
  }

  addInformacionFinanciera(): void {
    const formFin = this.fb.group({
      clfin_cod_tifin: [null, Validators.required],
      clfin_cod_ifina: [null],
      clfin_val_monto: [null, Validators.required],
      clfin_des_obser: [''],
      created_by: [1],
      updated_by: [1],
    });
    this.formInformacionFinanciera.push(formFin);
    this.showInformacionFinanciera = true;
  }

  removeInformacionFinanciera(index: number): void {
    this.formInformacionFinanciera.splice(index, 1);
    if (this.formInformacionFinanciera.length === 0) {
      this.showInformacionFinanciera = false;
    }
  }

  addBeneficiario(): void {
    if (!this.showUsuarioBancaDigital || !this.formUsuarioBancaDigital.valid) {
      this.snackBar.open('Debe crear primero el usuario de banca digital', 'Cerrar', { duration: 3000 });
      return;
    }

    const formBen = this.fb.group({
      clben_cod_perso: [null, Validators.required],
      clben_num_porce: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      created_by: [1],
      updated_by: [1],
    });
    this.formBeneficiarios.push(formBen);
    this.showBeneficiarios = true;
  }

  removeBeneficiario(index: number): void {
    this.formBeneficiarios.splice(index, 1);
    if (this.formBeneficiarios.length === 0) {
      this.showBeneficiarios = false;
    }
  }

  /**
   * Guarda los cambios
   */
  async onSubmit(): Promise<void> {
    if (this.formPersona.invalid || this.formCliente.invalid || 
        this.formDomicilio.invalid || this.formActividadEconomica.invalid) {
      this.snackBar.open('Por favor complete los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    const dto: RegistrarClienteCompletoRequestDto = {
      persona: this.formPersona.value,
      cliente: this.formCliente.value,
      domicilio: this.formDomicilio.value,
      actividadEconomica: this.formActividadEconomica.value,
      representante: this.showRepresentante && this.formRepresentante.valid 
        ? this.formRepresentante.value 
        : null,
      conyuge: this.showConyuge && this.formConyuge.valid 
        ? this.formConyuge.value 
        : null,
      informacionLaboral: this.showInformacionLaboral && this.formInformacionLaboral.valid 
        ? this.formInformacionLaboral.value 
        : null,
      referencias: this.showReferencias 
        ? this.formReferencias.filter(f => f.valid).map(f => f.value)
        : [],
      informacionFinanciera: this.showInformacionFinanciera 
        ? this.formInformacionFinanciera.filter(f => f.valid).map(f => f.value)
        : [],
      usuarioBancaDigital: this.showUsuarioBancaDigital && this.formUsuarioBancaDigital.valid 
        ? this.formUsuarioBancaDigital.value 
        : null,
      beneficiarios: this.showBeneficiarios 
        ? this.formBeneficiarios.filter(f => f.valid).map(f => f.value)
        : [],
      residenciaFiscal: this.showResidenciaFiscal && this.formResidenciaFiscal.valid 
        ? this.formResidenciaFiscal.value 
        : null,
      asamblea: this.showAsamblea && this.formAsamblea.valid 
        ? this.formAsamblea.value 
        : null,
    };

    try {
      await this.facade.actualizarClienteCompleto(this.clienteId, dto);
      this.snackBar.open(
        ClienEnum.messages.updateSuccess,
        'Cerrar',
        { duration: 3000 }
      );
      this.router.navigate([ClienEnum.routeList]);
    } catch (error: any) {
      this.snackBar.open(
        error?.message || ClienEnum.messages.updateError,
        'Cerrar',
        { duration: 5000 }
      );
    }
  }

  onCancel(): void {
    this.router.navigate([ClienEnum.routeList]);
  }
}

