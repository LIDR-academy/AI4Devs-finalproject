import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ClienRepository } from '../../infrastructure/repository/repository';
import {
  PersoEntity,
  ClienEntity,
  ClienteCompletoEntity,
  PersoParams,
  ClienParams,
} from '../../domain/entity';
import {
  CreatePersoRequestDto,
  UpdatePersoRequestDto,
  CreateClienRequestDto,
  UpdateClienRequestDto,
  RegistrarClienteCompletoRequestDto,
} from '../../infrastructure/dto/request';

/**
 * Facade para el módulo de Gestión de Clientes
 * Gestiona el estado y orquesta las operaciones usando Signals
 */
@Injectable({ providedIn: 'root' })
export class ClienFacade {
  private readonly repository = inject(ClienRepository);

  // ==================== STATE ====================

  // Data signals
  private readonly _personas = signal<PersoEntity[]>([]);
  private readonly _clientes = signal<ClienEntity[]>([]);
  private readonly _clienteCompleto = signal<ClienteCompletoEntity | null>(null);
  private readonly _selectedCliente = signal<ClienEntity | null>(null);

  // UI state signals
  private readonly _loading = signal<boolean>(false);
  private readonly _loadingPersonas = signal<boolean>(false);
  private readonly _loadingClientes = signal<boolean>(false);
  private readonly _loadingCompleto = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _showInactive = signal<boolean>(false);

  // Pagination signals
  private readonly _totalPersonas = signal<number>(0);
  private readonly _totalClientes = signal<number>(0);
  private readonly _pagePersonas = signal<number>(1);
  private readonly _pageClientes = signal<number>(1);
  private readonly _limitPersonas = signal<number>(10);
  private readonly _limitClientes = signal<number>(10);

  // ==================== PUBLIC SELECTORS ====================

  /** Lista de personas */
  readonly personas = this._personas.asReadonly();

  /** Lista de clientes */
  readonly clientes = this._clientes.asReadonly();

  /** Cliente completo seleccionado */
  readonly clienteCompleto = this._clienteCompleto.asReadonly();

  /** Cliente seleccionado */
  readonly selectedCliente = this._selectedCliente.asReadonly();

  /** Estado de carga general */
  readonly loading = this._loading.asReadonly();

  /** Estado de carga de personas */
  readonly loadingPersonas = this._loadingPersonas.asReadonly();

  /** Estado de carga de clientes */
  readonly loadingClientes = this._loadingClientes.asReadonly();

  /** Estado de carga de cliente completo */
  readonly loadingCompleto = this._loadingCompleto.asReadonly();

  /** Error actual */
  readonly error = this._error.asReadonly();

  /** Mostrar inactivos */
  readonly showInactive = this._showInactive.asReadonly();

  /** Total de personas */
  readonly totalPersonas = this._totalPersonas.asReadonly();

  /** Total de clientes */
  readonly totalClientes = this._totalClientes.asReadonly();

  /** Página actual de personas */
  readonly pagePersonas = this._pagePersonas.asReadonly();

  /** Página actual de clientes */
  readonly pageClientes = this._pageClientes.asReadonly();

  /** Límite por página de personas */
  readonly limitPersonas = this._limitPersonas.asReadonly();

  /** Límite por página de clientes */
  readonly limitClientes = this._limitClientes.asReadonly();

  // ==================== COMPUTED ====================

  /** Personas filtradas (activas o todas) */
  readonly personasFiltered = computed(() => {
    const personas = this._personas();
    const showInactive = this._showInactive();
    
    if (showInactive) {
      return personas;
    }
    
    return personas.filter(p => !p.deleted_at);
  });

  /** Clientes filtrados (activos o todos) */
  readonly clientesFiltered = computed(() => {
    const clientes = this._clientes();
    const showInactive = this._showInactive();
    
    if (showInactive) {
      return clientes;
    }
    
    return clientes.filter(c => !c.deleted_at);
  });

  /** Hay más páginas de personas */
  readonly hasMorePersonas = computed(() => {
    const total = this._totalPersonas();
    const page = this._pagePersonas();
    const limit = this._limitPersonas();
    return (page * limit) < total;
  });

  /** Hay más páginas de clientes */
  readonly hasMoreClientes = computed(() => {
    const total = this._totalClientes();
    const page = this._pageClientes();
    const limit = this._limitClientes();
    return (page * limit) < total;
  });

  // ==================== PERSONAS ====================

  /**
   * Carga listado de personas
   */
  async loadPersonas(params?: PersoParams): Promise<void> {
    this._loadingPersonas.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.getPersonas(params));
      
      this._personas.set(response.data);
      this._totalPersonas.set(response.total);
      this._pagePersonas.set(response.page);
      this._limitPersonas.set(response.limit);
    } catch (error: any) {
      this._error.set(error?.message || 'Error al cargar personas');
      throw error;
    } finally {
      this._loadingPersonas.set(false);
    }
  }

  /**
   * Obtiene una persona por ID
   */
  async getPersonaById(id: number): Promise<PersoEntity> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.getPersonaById(id));
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al obtener persona');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Busca una persona por identificación
   */
  async getPersonaByIdentificacion(identificacion: string): Promise<PersoEntity | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.getPersonaByIdentificacion(identificacion));
      return response.data;
    } catch (error: any) {
      // Si no se encuentra, retornar null en lugar de lanzar error
      if (error?.status === 404) {
        return null;
      }
      this._error.set(error?.message || 'Error al buscar persona');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Crea una nueva persona
   */
  async createPersona(data: CreatePersoRequestDto): Promise<PersoEntity> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.createPersona(data));
      
      // Agregar a la lista local
      const current = this._personas();
      this._personas.set([...current, response.data]);
      this._totalPersonas.update(total => total + 1);
      
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al crear persona');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Actualiza una persona
   */
  async updatePersona(id: number, data: UpdatePersoRequestDto): Promise<PersoEntity> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.updatePersona(id, data));
      
      // Actualizar en la lista local
      const current = this._personas();
      const index = current.findIndex(p => p.perso_cod_perso === id);
      if (index >= 0) {
        current[index] = response.data;
        this._personas.set([...current]);
      }
      
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al actualizar persona');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Elimina una persona (soft delete)
   */
  async deletePersona(id: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await firstValueFrom(this.repository.deletePersona(id));
      
      // Remover de la lista local si no se muestran inactivos
      if (!this._showInactive()) {
        const current = this._personas();
        this._personas.set(current.filter(p => p.perso_cod_perso !== id));
        this._totalClientes.update(total => total - 1);
      }
    } catch (error: any) {
      this._error.set(error?.message || 'Error al eliminar persona');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // ==================== CLIENTES ====================

  /**
   * Carga listado de clientes
   */
  async loadClientes(params?: ClienParams): Promise<void> {
    this._loadingClientes.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.getClientes(params));
      
      this._clientes.set(response.data);
      this._totalClientes.set(response.total);
      this._pageClientes.set(response.page);
      this._limitClientes.set(response.limit);
    } catch (error: any) {
      this._error.set(error?.message || 'Error al cargar clientes');
      throw error;
    } finally {
      this._loadingClientes.set(false);
    }
  }

  /**
   * Obtiene un cliente por ID
   */
  async getClienteById(id: number): Promise<ClienEntity> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.getClienteById(id));
      this._selectedCliente.set(response.data);
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al obtener cliente');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Obtiene un cliente completo por ID
   */
  async getClienteCompletoById(id: number): Promise<ClienteCompletoEntity> {
    this._loadingCompleto.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.getClienteCompletoById(id));
      this._clienteCompleto.set(response.data);
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al obtener cliente completo');
      throw error;
    } finally {
      this._loadingCompleto.set(false);
    }
  }

  /**
   * Crea un nuevo cliente
   */
  async createCliente(data: CreateClienRequestDto): Promise<ClienEntity> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.createCliente(data));
      
      // Agregar a la lista local
      const current = this._clientes();
      this._clientes.set([...current, response.data]);
      this._totalClientes.update(total => total + 1);
      
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al crear cliente');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Actualiza un cliente
   */
  async updateCliente(id: number, data: UpdateClienRequestDto): Promise<ClienEntity> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.updateCliente(id, data));
      
      // Actualizar en la lista local
      const current = this._clientes();
      const index = current.findIndex(c => c.clien_cod_clien === id);
      if (index >= 0) {
        current[index] = response.data;
        this._clientes.set([...current]);
      }
      
      // Actualizar seleccionado si es el mismo
      if (this._selectedCliente()?.clien_cod_clien === id) {
        this._selectedCliente.set(response.data);
      }
      
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al actualizar cliente');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Elimina un cliente (soft delete)
   */
  async deleteCliente(id: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await firstValueFrom(this.repository.deleteCliente(id));
      
      // Remover de la lista local si no se muestran inactivos
      if (!this._showInactive()) {
        const current = this._clientes();
        this._clientes.set(current.filter(c => c.clien_cod_clien !== id));
        this._totalClientes.update(total => total - 1);
      }
      
      // Limpiar selección si es el mismo
      if (this._selectedCliente()?.clien_cod_clien === id) {
        this._selectedCliente.set(null);
      }
    } catch (error: any) {
      this._error.set(error?.message || 'Error al eliminar cliente');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // ==================== TRANSACCIONES UNIFICADAS ====================

  /**
   * Registra un cliente completo con todos sus datos relacionados
   */
  async registrarClienteCompleto(data: RegistrarClienteCompletoRequestDto): Promise<ClienteCompletoEntity> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.registrarClienteCompleto(data));
      
      // Agregar cliente a la lista local
      const current = this._clientes();
      this._clientes.set([...current, response.data.cliente]);
      this._totalClientes.update(total => total + 1);
      
      // Establecer como completo seleccionado
      this._clienteCompleto.set(response.data);
      
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al registrar cliente completo');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Actualiza un cliente completo con todos sus datos relacionados
   */
  async actualizarClienteCompleto(id: number, data: RegistrarClienteCompletoRequestDto): Promise<ClienteCompletoEntity> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(this.repository.actualizarClienteCompleto(id, data));
      
      // Actualizar en la lista local
      const current = this._clientes();
      const index = current.findIndex(c => c.clien_cod_clien === id);
      if (index >= 0) {
        current[index] = response.data.cliente;
        this._clientes.set([...current]);
      }
      
      // Actualizar completo seleccionado
      this._clienteCompleto.set(response.data);
      
      return response.data;
    } catch (error: any) {
      this._error.set(error?.message || 'Error al actualizar cliente completo');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // ==================== UI ACTIONS ====================

  /**
   * Selecciona un cliente
   */
  selectCliente(cliente: ClienEntity | null): void {
    this._selectedCliente.set(cliente);
  }

  /**
   * Limpia la selección de cliente
   */
  clearSelection(): void {
    this._selectedCliente.set(null);
    this._clienteCompleto.set(null);
  }

  /**
   * Toggle mostrar inactivos
   */
  toggleShowInactive(): void {
    this._showInactive.update(value => !value);
  }

  /**
   * Limpia el error
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Resetea el estado del módulo
   */
  reset(): void {
    this._personas.set([]);
    this._clientes.set([]);
    this._clienteCompleto.set(null);
    this._selectedCliente.set(null);
    this._error.set(null);
    this._totalPersonas.set(0);
    this._totalClientes.set(0);
    this._pagePersonas.set(1);
    this._pageClientes.set(1);
  }
}

