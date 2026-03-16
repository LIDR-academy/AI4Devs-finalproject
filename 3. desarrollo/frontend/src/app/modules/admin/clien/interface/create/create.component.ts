import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Router, RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';

import { ClienFacade } from 'app/modules/admin/confi/management/clien/application/facades/clien.facade';
import { ClienEnum } from 'app/modules/admin/confi/management/clien/infrastructure/enum/enum';
import { RegistrarClienteCompletoRequestDto } from 'app/modules/admin/confi/management/clien/infrastructure/dto/request/registrar-cliente-completo.request.dto';
import { CatalogService } from 'app/modules/admin/confi/management/clien/infrastructure/services/catalog.service';
import { GeoFacade } from 'app/modules/admin/confi/parameter/geo/application/facades/geo.facade';
import { CiiuFacade } from 'app/modules/admin/confi/parameter/ciiu/application/facades/ciiu.facade';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from 'app/modules/admin/confi/parameter/geo/domain/entity';
import { ActividadCompletaEntity } from 'app/modules/admin/confi/parameter/ciiu/domain/entity';
import { PersoEntity } from 'app/modules/admin/confi/management/clien/domain/entity';

/**
 * Componente para registrar un nuevo cliente completo
 * Formulario multi-sección con tabs para organizar los módulos auxiliares
 */
@Component({
  selector: 'app-clien-create',
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
    MatStepperModule,
    MatAutocompleteModule,
  ],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienCreateComponent implements OnInit {
  readonly facade = inject(ClienFacade);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly catalogService = inject(CatalogService);
  private readonly geoFacade = inject(GeoFacade);
  private readonly ciiuFacade = inject(CiiuFacade);

  // Exposed signals
  readonly loading = this.facade.loading;

  // Form groups
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

  // Flags para mostrar/ocultar secciones opcionales
  showRepresentante = false;
  showConyuge = false;
  showInformacionLaboral = false;
  showReferencias = false;
  showInformacionFinanciera = false;
  showUsuarioBancaDigital = false;
  showBeneficiarios = false;
  showResidenciaFiscal = false;
  showAsamblea = false;

  // Catálogos
  readonly oficinas = this.catalogService.oficinas;
  readonly tiposPersona = this.catalogService.tiposPersona;
  readonly tiposIdentificacion = this.catalogService.tiposIdentificacion;
  readonly sexos = this.catalogService.sexos;
  readonly nacionalidades = this.catalogService.nacionalidades;
  readonly nivelesInstruccion = this.catalogService.nivelesInstruccion;
  readonly tiposRepresentante = this.catalogService.tiposRepresentante;
  readonly tiposReferencia = this.catalogService.tiposReferencia;
  readonly tiposInformacionFinanciera = this.catalogService.tiposInformacionFinanciera;
  readonly tiposCuenta = this.catalogService.tiposCuenta;
  readonly institucionesFinancieras = this.catalogService.institucionesFinancieras;
  readonly tiposContrato = this.catalogService.tiposContrato;
  readonly tiposRepresentanteAsamblea = this.catalogService.tiposRepresentanteAsamblea;
  readonly paises = this.catalogService.paises;
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

  // Búsqueda de personas (para autocomplete)
  personasBuscadas: PersoEntity[] = [];
  loadingPersonas = false;

  // Selecciones GEO
  selectedProvincia: ProvinciaEntity | null = null;
  selectedCanton: CantonEntity | null = null;

  ngOnInit(): void {
    this.initForms();
    this.loadCatalogs();
  }

  /**
   * Carga todos los catálogos necesarios
   */
  async loadCatalogs(): Promise<void> {
    // TODO: Obtener empresaId del usuario autenticado o contexto
    await this.catalogService.loadAllCatalogs();
    await this.geoFacade.loadProvincias();
  }

  /**
   * Inicializa todos los formularios
   */
  initForms(): void {
    // Formulario Persona
    this.formPersona = this.fb.group({
      perso_cod_tpers: [1, Validators.required], // 1=Natural, 2=Jurídica
      perso_cod_tiden: [1, Validators.required], // 1=Cédula, 2=RUC
      perso_ide_perso: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
      perso_nom_perso: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      perso_fec_inici: [null],
      perso_cod_sexos: [null],
      perso_cod_nacio: [null],
      perso_cod_instr: [null],
      perso_ema_perso: ['', Validators.email],
      perso_tel_perso: [''],
      perso_cel_perso: [''],
      created_by: [1], // TODO: Obtener del usuario autenticado
      updated_by: [1],
    });

    // Formulario Cliente
    this.formCliente = this.fb.group({
      clien_cod_ofici: [null, Validators.required],
      clien_ctr_socio: [false, Validators.required],
      clien_fec_ingin: [new Date(), Validators.required],
      clien_fec_salid: [null],
      clien_des_obser: [''],
      created_by: [1],
      updated_by: [1],
    });

    // Formulario Domicilio
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

    // Formulario Actividad Económica
    this.formActividadEconomica = this.fb.group({
      cleco_cod_aebce: ['', Validators.required],
      created_by: [1],
      updated_by: [1],
    });

    // Formulario Representante (opcional)
    this.formRepresentante = this.fb.group({
      clrep_cod_perso: [null, Validators.required],
      clrep_cod_trep: [null, Validators.required],
      clrep_fec_nombr: [null],
      clrep_fec_venci: [null],
      clrep_obs_clrep: ['', Validators.maxLength(200)],
      created_by: [1],
      updated_by: [1],
    });

    // Formulario Cónyuge (opcional)
    this.formConyuge = this.fb.group({
      clcyg_cod_perso: [null, Validators.required],
      clcyg_nom_empre: ['', Validators.maxLength(150)],
      clcyg_des_cargo: ['', Validators.maxLength(100)],
      clcyg_val_ingre: [null, [Validators.min(0)]],
      created_by: [1],
      updated_by: [1],
    });

    // Formulario Información Laboral (opcional)
    this.formInformacionLaboral = this.fb.group({
      cllab_cod_depen: [null],
      cllab_des_cargo: ['', Validators.maxLength(100)],
      cllab_cod_tcont: [null],
      cllab_fec_ingre: [null],
      cllab_fec_finct: [null],
      cllab_val_ingre: [null, [Validators.min(0)]],
      cllab_dir_traba: ['', Validators.maxLength(300)],
      cllab_tlf_traba: ['', Validators.maxLength(15)],
      created_by: [1],
      updated_by: [1],
    });

    // Formulario Usuario Banca Digital (opcional)
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

    // Formulario Residencia Fiscal (opcional)
    this.formResidenciaFiscal = this.fb.group({
      clrfi_ctr_resfi: [false],
      clrfi_cod_nacio: [null],
      clrfi_dir_resfi: ['', Validators.maxLength(200)],
      clrfi_des_provi: ['', Validators.maxLength(50)],
      clrfi_des_ciuda: ['', Validators.maxLength(50)],
      clrfi_cod_posta: ['', Validators.maxLength(10)],
      created_by: [1],
      updated_by: [1],
    });

    // Formulario Asamblea (opcional, solo socios)
    this.formAsamblea = this.fb.group({
      clasm_cod_rasam: [null],
      clasm_fec_rasam: [null],
      clasm_ctr_direc: [false],
      clasm_fec_direc: [null],
      created_by: [1],
      updated_by: [1],
    });

    // Listeners para mostrar/ocultar secciones según reglas de negocio
    this.formPersona.get('perso_cod_tpers')?.valueChanges.subscribe(tipo => {
      // Si es Jurídica (2) o menor de edad, mostrar representante
      // TODO: Calcular edad desde perso_fec_inici
    });

    this.formCliente.get('clien_ctr_socio')?.valueChanges.subscribe(esSocio => {
      // Si es socio, mostrar asamblea
      this.showAsamblea = esSocio;
      if (!esSocio) {
        this.formAsamblea.reset();
      }
    });

    // Listener para cargar cantones cuando se selecciona provincia
    this.formDomicilio.get('cldom_cod_provi')?.valueChanges.subscribe(async (provinciaId: number) => {
      if (provinciaId) {
        const provincia = this.provincias().find(p => p.provi_cod_provi === provinciaId);
        if (provincia) {
          this.selectedProvincia = provincia;
          await this.geoFacade.loadCantonesByProvincia(provincia.provi_cod_prov);
          // Reset cantón y parroquia
          this.formDomicilio.patchValue({
            cldom_cod_canto: null,
            cldom_cod_parro: null,
          });
        }
      }
    });

    // Listener para cargar parroquias cuando se selecciona cantón
    this.formDomicilio.get('cldom_cod_canto')?.valueChanges.subscribe(async (cantonId: number) => {
      if (cantonId && this.selectedProvincia) {
        const canton = this.cantones().find(c => c.canto_cod_canto === cantonId);
        if (canton) {
          this.selectedCanton = canton;
          await this.geoFacade.loadParroquiasByCanton(
            this.selectedProvincia.provi_cod_prov,
            canton.canto_cod_cant
          );
          // Reset parroquia
          this.formDomicilio.patchValue({ cldom_cod_parro: null });
        }
      }
    });
  }

  /**
   * Busca actividades económicas CIIU
   */
  async onSearchCiiu(query: string): Promise<void> {
    if (query && query.length >= 3) {
      await this.ciiuFacade.searchActividades(query, 20);
    } else {
      // Limpiar resultados si la búsqueda es muy corta
      this.ciiuFacade['_actividades'].set([]);
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
   * Busca personas por identificación o nombre (para autocomplete)
   */
  async onSearchPersona(query: string, formGroup: FormGroup, fieldName: string): Promise<void> {
    if (!query || query.length < 3) {
      this.personasBuscadas = [];
      return;
    }

    this.loadingPersonas = true;
    try {
      const response = await this.facade.getPersonas({
        identificacion: query.length === 10 || query.length === 13 ? query : undefined,
        nombre: query.length >= 3 ? query : undefined,
        limit: 10,
      });
      this.personasBuscadas = response.data;
    } catch (error) {
      console.error('Error searching personas:', error);
      this.personasBuscadas = [];
    } finally {
      this.loadingPersonas = false;
    }
  }

  /**
   * Selecciona una persona del autocomplete
   */
  onSelectPersona(persona: PersoEntity, formGroup: FormGroup, fieldName: string): void {
    formGroup.patchValue({ [fieldName]: persona.perso_cod_perso });
    this.personasBuscadas = [];
  }

  /**
   * Verifica si el tipo de referencia es financiera
   */
  isReferenciaFinanciera(tipoReferencia: number): boolean {
    return tipoReferencia === 3;
  }

  /**
   * Verifica si es directivo para mostrar fecha de nombramiento
   */
  onDirectivoChange(formGroup: FormGroup): void {
    const esDirectivo = formGroup.get('clasm_ctr_direc')?.value;
    const fecDirec = formGroup.get('clasm_fec_direc');
    if (esDirectivo) {
      fecDirec?.setValidators([Validators.required]);
    } else {
      fecDirec?.clearValidators();
      fecDirec?.setValue(null);
    }
    fecDirec?.updateValueAndValidity();
  }

  /**
   * Agrega una nueva referencia
   */
  addReferencia(): void {
    const formRef = this.fb.group({
      clref_cod_tiref: [null, Validators.required],
      clref_cod_perso: [null], // Opcional: puede ser persona registrada o datos manuales
      clref_nom_refer: ['', Validators.maxLength(150)],
      clref_dir_refer: ['', Validators.maxLength(200)],
      clref_tlf_refer: ['', Validators.maxLength(15)],
      clref_num_ctadp: ['', Validators.maxLength(30)], // Solo si es financiera
      clref_val_saldo: [null, [Validators.min(0)]], // Solo si es financiera
      clref_fec_apert: [null], // Solo si es financiera
      created_by: [1],
      updated_by: [1],
    });
    
    // Listener para mostrar/ocultar campos financieros según tipo
    formRef.get('clref_cod_tiref')?.valueChanges.subscribe(tipo => {
      const esFinanciera = tipo === 3;
      const numCuenta = formRef.get('clref_num_ctadp');
      const valSaldo = formRef.get('clref_val_saldo');
      const fecApert = formRef.get('clref_fec_apert');
      
      if (esFinanciera) {
        numCuenta?.setValidators([Validators.required, Validators.maxLength(30)]);
        valSaldo?.setValidators([Validators.required, Validators.min(0)]);
        fecApert?.setValidators([Validators.required]);
      } else {
        numCuenta?.clearValidators();
        valSaldo?.clearValidators();
        fecApert?.clearValidators();
        numCuenta?.setValue('');
        valSaldo?.setValue(null);
        fecApert?.setValue(null);
      }
      numCuenta?.updateValueAndValidity();
      valSaldo?.updateValueAndValidity();
      fecApert?.updateValueAndValidity();
    });
    
    this.formReferencias.push(formRef);
    this.showReferencias = true;
  }

  /**
   * Elimina una referencia
   */
  removeReferencia(index: number): void {
    this.formReferencias.splice(index, 1);
    if (this.formReferencias.length === 0) {
      this.showReferencias = false;
    }
  }

  /**
   * Agrega información financiera
   */
  addInformacionFinanciera(): void {
    const formFin = this.fb.group({
      clfin_cod_tifin: [null, Validators.required], // I=Ingreso, G=Gasto, A=Activo, P=Pasivo
      clfin_val_monto: [null, [Validators.required, Validators.min(0)]],
      created_by: [1],
      updated_by: [1],
    });
    this.formInformacionFinanciera.push(formFin);
    this.showInformacionFinanciera = true;
  }

  /**
   * Elimina información financiera
   */
  removeInformacionFinanciera(index: number): void {
    this.formInformacionFinanciera.splice(index, 1);
    if (this.formInformacionFinanciera.length === 0) {
      this.showInformacionFinanciera = false;
    }
  }

  /**
   * Agrega un beneficiario
   */
  addBeneficiario(): void {
    if (!this.showUsuarioBancaDigital || !this.formUsuarioBancaDigital.valid) {
      this.snackBar.open('Debe crear primero el usuario de banca digital', 'Cerrar', { duration: 3000 });
      return;
    }

    const formBen = this.fb.group({
      clben_num_cuent: ['', [Validators.required, Validators.maxLength(20)]],
      clben_cod_tcuen: [null, Validators.required], // 1=Ahorros, 2=Corriente
      clben_cod_ifina: [null], // Solo si es externo
      clben_nom_benef: ['', [Validators.required, Validators.maxLength(250)]],
      clben_ide_benef: ['', [Validators.required, Validators.maxLength(20)]],
      clben_cod_tiden: [null],
      clben_ema_benef: ['', [Validators.email, Validators.maxLength(150)]],
      clben_ctr_exter: [false],
      clben_ali_benef: ['', Validators.maxLength(50)],
      clben_ctr_activ: [true],
      created_by: [1],
      updated_by: [1],
    });
    
    // Listener para mostrar/ocultar institución financiera si es externo
    formBen.get('clben_ctr_exter')?.valueChanges.subscribe(esExterno => {
      const ifina = formBen.get('clben_cod_ifina');
      if (esExterno) {
        ifina?.setValidators([Validators.required]);
      } else {
        ifina?.clearValidators();
        ifina?.setValue(null);
      }
      ifina?.updateValueAndValidity();
    });
    
    this.formBeneficiarios.push(formBen);
    this.showBeneficiarios = true;
  }

  /**
   * Elimina un beneficiario
   */
  removeBeneficiario(index: number): void {
    this.formBeneficiarios.splice(index, 1);
    if (this.formBeneficiarios.length === 0) {
      this.showBeneficiarios = false;
    }
  }

  /**
   * Valida y envía el formulario
   */
  async onSubmit(): Promise<void> {
    // Validar formularios principales
    if (this.formPersona.invalid || this.formCliente.invalid || 
        this.formDomicilio.invalid || this.formActividadEconomica.invalid) {
      this.snackBar.open('Por favor complete los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    // Construir DTO
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
      await this.facade.registrarClienteCompleto(dto);
      this.snackBar.open(
        ClienEnum.messages.createSuccess,
        'Cerrar',
        { duration: 3000 }
      );
      this.router.navigate([ClienEnum.routeList]);
    } catch (error: any) {
      this.snackBar.open(
        error?.message || ClienEnum.messages.createError,
        'Cerrar',
        { duration: 5000 }
      );
    }
  }

  /**
   * Cancela y regresa al listado
   */
  onCancel(): void {
    this.router.navigate([ClienEnum.routeList]);
  }
}

