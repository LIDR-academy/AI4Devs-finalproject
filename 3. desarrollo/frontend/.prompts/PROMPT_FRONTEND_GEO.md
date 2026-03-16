# ============================================================================
# FINANTIX - FRONTEND: GEOGRAPHIC CATALOG MODULE (GEO)
# Angular 19 + Fuse Template Implementation
# ============================================================================
# Version: 1.0.0
# Target: Cursor AI / Claude
# Language: English + SudoLang
# Reference: template_crud_core.md, .cursorrules, IMPLEMENTACION-GEO-RESUMEN.md
# ============================================================================

## CONTEXT

```sudolang
Project {
  name: "FINANTIX"
  type: "Financial Core System for Credit Unions (Ecuador)"
  
  frontend {
    framework: "Angular 19"
    template: "Fuse"
    styling: "Angular Material + Tailwind CSS"
    stateManagement: "Signals + Facade Pattern"
  }
  
  backend {
    microservice: "MS-CONFI"
    port: 8012
    gateway: "MS-CORE (port 8000)"
    module: "geo"
    status: "✅ Implemented and ready"
  }
  
  architecture: "Hexagonal (Clean Architecture)"
  references: ["template_crud_core.md", ".cursorrules"]
}
```

## MISSION

```sudolang
Mission {
  goal: "Implement Angular frontend for Geographic Catalog module"
  
  requirements {
    - Single hierarchical view for Province > Canton > Parish management
    - CRUD dialogs for each entity level
    - Cascading dropdown component (reusable for partner/address forms)
    - Integration with existing backend API
    - Spanish UI labels and validation messages
    - Administrator-only access
  }
  
  deliverables {
    - Complete module structure following hexagonal architecture
    - GeoFacade for state management with signals
    - GeoAdapter for HTTP communication
    - Hierarchical tree view component
    - CRUD dialog components (Province, Canton, Parish)
    - Reusable CascadingSelectComponent
    - Route configuration
    - Navigation menu integration
  }
}
```

---

## BACKEND API REFERENCE

```sudolang
API {
  baseUrl: "http://localhost:8000/api/v1"  // Via MS-CORE gateway
  directUrl: "http://localhost:8012"        // Direct to MS-CONFI (dev only)
  
  endpoints {
    provinces {
      GET    /geo/provincias?active=true           // List provinces
      POST   /geo/provincias                       // Create province
      PUT    /geo/provincias/:id                   // Update province
      DELETE /geo/provincias/:id                   // Soft delete
    }
    
    cantons {
      GET    /geo/provincias/:provi_cod_prov/cantones?active=true  // List by province
      POST   /geo/cantones                         // Create canton
      PUT    /geo/cantones/:id                     // Update canton
      DELETE /geo/cantones/:id                     // Soft delete
    }
    
    parishes {
      GET    /geo/provincias/:provi_cod_prov/cantones/:canto_cod_cant/parroquias?active=true
      GET    /geo/parroquias/search?q=TEXT&limit=20  // Search parishes
      POST   /geo/parroquias                        // Create parish
      PUT    /geo/parroquias/:id                    // Update parish
      DELETE /geo/parroquias/:id                    // Soft delete
    }
  }
  
  dataStructure {
    provincia {
      provi_cod_provi: number      // Primary key (SERIAL)
      provi_cod_prov: string       // SEPS code (2 chars, e.g., "01")
      provi_nom_prov: string       // Name
      provi_ctr_activo: boolean    // Active status
      provi_fec_creac: Date
      provi_fec_modif: Date
      provi_fec_elimi: Date | null
    }
    
    canton {
      canto_cod_canto: number      // Primary key (SERIAL)
      provi_cod_provi: number      // FK to provincia
      canto_cod_cant: string       // SEPS code (2 chars)
      canto_nom_cant: string       // Name
      canto_ctr_activo: boolean
      canto_fec_creac: Date
      canto_fec_modif: Date
      canto_fec_elimi: Date | null
    }
    
    parroquia {
      parro_cod_parro: number      // Primary key (SERIAL)
      canto_cod_canto: number      // FK to canton
      parro_cod_parr: string       // SEPS code (2 chars)
      parro_nom_parr: string       // Name
      parro_tip_area: 'R' | 'U' | null  // Rural/Urban
      parro_ctr_activo: boolean
      parro_fec_creac: Date
      parro_fec_modif: Date
      parro_fec_elimi: Date | null
    }
  }
}
```

---

## MODULE STRUCTURE

```sudolang
Frontend {
  moduleName: "geo"
  route: "/configuracion/catalogo-geografico"
  
  structure {
    src/app/modules/geo/
    ├── application/
    │   ├── facades/
    │   │   └── geo.facade.ts              // State management with signals
    │   └── usecases/
    │       ├── load-provincias.usecase.ts
    │       ├── load-cantones.usecase.ts
    │       ├── load-parroquias.usecase.ts
    │       ├── save-provincia.usecase.ts
    │       ├── save-canton.usecase.ts
    │       ├── save-parroquia.usecase.ts
    │       ├── delete-provincia.usecase.ts
    │       ├── delete-canton.usecase.ts
    │       ├── delete-parroquia.usecase.ts
    │       ├── search-parroquias.usecase.ts
    │       └── index.ts
    │
    ├── domain/
    │   ├── entities/
    │   │   ├── provincia.entity.ts
    │   │   ├── canton.entity.ts
    │   │   ├── parroquia.entity.ts
    │   │   └── index.ts
    │   ├── ports/
    │   │   ├── geo.port.ts
    │   │   └── index.ts
    │   └── value-objects/
    │       ├── codigo-seps.vo.ts
    │       ├── tipo-area.vo.ts
    │       └── index.ts
    │
    ├── infrastructure/
    │   ├── adapters/
    │   │   ├── geo.adapter.ts             // HTTP service
    │   │   └── index.ts
    │   ├── dto/
    │   │   ├── request/
    │   │   │   ├── create-provincia.request.dto.ts
    │   │   │   ├── update-provincia.request.dto.ts
    │   │   │   ├── create-canton.request.dto.ts
    │   │   │   ├── update-canton.request.dto.ts
    │   │   │   ├── create-parroquia.request.dto.ts
    │   │   │   ├── update-parroquia.request.dto.ts
    │   │   │   └── index.ts
    │   │   ├── response/
    │   │   │   ├── provincia.response.dto.ts
    │   │   │   ├── canton.response.dto.ts
    │   │   │   ├── parroquia.response.dto.ts
    │   │   │   └── index.ts
    │   │   └── index.ts
    │   ├── mappers/
    │   │   ├── provincia.mapper.ts
    │   │   ├── canton.mapper.ts
    │   │   ├── parroquia.mapper.ts
    │   │   └── index.ts
    │   └── state/
    │       └── geo.state.ts               // Signal-based state
    │
    ├── interface/
    │   └── views/
    │       ├── geo-catalog/               // Main hierarchical view
    │       │   ├── geo-catalog.component.ts
    │       │   ├── geo-catalog.component.html
    │       │   └── geo-catalog.component.scss
    │       └── components/
    │           ├── provincia-dialog/
    │           │   ├── provincia-dialog.component.ts
    │           │   ├── provincia-dialog.component.html
    │           │   └── provincia-dialog.component.scss
    │           ├── canton-dialog/
    │           │   ├── canton-dialog.component.ts
    │           │   ├── canton-dialog.component.html
    │           │   └── canton-dialog.component.scss
    │           ├── parroquia-dialog/
    │           │   ├── parroquia-dialog.component.ts
    │           │   ├── parroquia-dialog.component.html
    │           │   └── parroquia-dialog.component.scss
    │           └── cascading-select/      // Reusable component
    │               ├── cascading-select.component.ts
    │               ├── cascading-select.component.html
    │               └── cascading-select.component.scss
    │
    ├── geo.module.ts
    └── geo.routes.ts
  }
}
```

---

## DOMAIN ENTITIES

```typescript
// domain/entities/provincia.entity.ts

/**
 * Entidad de dominio Provincia
 * Representa una provincia del Ecuador según clasificación SEPS/INEC
 */
export interface ProvinciaEntity {
  /** ID interno (SERIAL) */
  id: number;
  /** Código SEPS de 2 dígitos (ej: "01") */
  codigoSeps: string;
  /** Nombre de la provincia */
  nombre: string;
  /** Estado activo */
  activo: boolean;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de última modificación */
  fechaModificacion: Date;
  /** Fecha de eliminación (soft delete) */
  fechaEliminacion: Date | null;
}

/**
 * Verifica si la provincia está disponible (activa y no eliminada)
 */
export function provinciaEstaDisponible(provincia: ProvinciaEntity): boolean {
  return provincia.activo && !provincia.fechaEliminacion;
}
```

```typescript
// domain/entities/canton.entity.ts

/**
 * Entidad de dominio Cantón
 */
export interface CantonEntity {
  /** ID interno (SERIAL) */
  id: number;
  /** ID de la provincia padre */
  provinciaId: number;
  /** Código SEPS de 2 dígitos (ej: "01") */
  codigoSeps: string;
  /** Nombre del cantón */
  nombre: string;
  /** Estado activo */
  activo: boolean;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de última modificación */
  fechaModificacion: Date;
  /** Fecha de eliminación (soft delete) */
  fechaEliminacion: Date | null;
  
  // Denormalized for display (from join)
  /** Código SEPS de la provincia (para mostrar) */
  provinciaCodigoSeps?: string;
  /** Nombre de la provincia (para mostrar) */
  provinciaNombre?: string;
}
```

```typescript
// domain/entities/parroquia.entity.ts

export type TipoArea = 'R' | 'U' | null;

/**
 * Entidad de dominio Parroquia
 */
export interface ParroquiaEntity {
  /** ID interno (SERIAL) */
  id: number;
  /** ID del cantón padre */
  cantonId: number;
  /** Código SEPS de 2 dígitos (ej: "50") */
  codigoSeps: string;
  /** Nombre de la parroquia */
  nombre: string;
  /** Tipo de área: R=Rural, U=Urbana, null=No especificado */
  tipoArea: TipoArea;
  /** Estado activo */
  activo: boolean;
  /** Fecha de creación */
  fechaCreacion: Date;
  /** Fecha de última modificación */
  fechaModificacion: Date;
  /** Fecha de eliminación (soft delete) */
  fechaEliminacion: Date | null;
  
  // Denormalized for display
  /** Código SEPS del cantón */
  cantonCodigoSeps?: string;
  /** Nombre del cantón */
  cantonNombre?: string;
  /** Código SEPS de la provincia */
  provinciaCodigoSeps?: string;
  /** Nombre de la provincia */
  provinciaNombre?: string;
  /** Código compuesto PPCCPP (6 dígitos) */
  codigoCompleto?: string;
}

/**
 * Genera el código compuesto de 6 dígitos
 */
export function generarCodigoCompleto(
  provinciaCodigoSeps: string,
  cantonCodigoSeps: string,
  parroquiaCodigoSeps: string
): string {
  return `${provinciaCodigoSeps}${cantonCodigoSeps}${parroquiaCodigoSeps}`;
}

/**
 * Obtiene descripción del tipo de área
 */
export function getDescripcionTipoArea(tipo: TipoArea): string {
  switch (tipo) {
    case 'U': return 'Urbana';
    case 'R': return 'Rural';
    default: return 'No especificado';
  }
}
```

---

## INFRASTRUCTURE ADAPTER

```typescript
// infrastructure/adapters/geo.adapter.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';

// DTOs
import { 
  ProvinciaResponseDto, 
  CantonResponseDto, 
  ParroquiaResponseDto 
} from '../dto/response';
import {
  CreateProvinciaRequestDto,
  UpdateProvinciaRequestDto,
  CreateCantonRequestDto,
  UpdateCantonRequestDto,
  CreateParroquiaRequestDto,
  UpdateParroquiaRequestDto,
} from '../dto/request';

// Mappers
import { ProvinciaMapper, CantonMapper, ParroquiaMapper } from '../mappers';

// Entities
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from '../../domain/entities';

/**
 * Adaptador HTTP para el módulo de Catálogo Geográfico
 * Comunica con MS-CONFI a través de MS-CORE gateway
 */
@Injectable({ providedIn: 'root' })
export class GeoAdapter {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/geo`;

  // ==================== PROVINCIAS ====================

  /**
   * Obtiene listado de provincias
   * @param activeOnly Si es true, solo retorna provincias activas
   */
  getProvincias(activeOnly: boolean = true): Observable<ProvinciaEntity[]> {
    const params = new HttpParams().set('active', activeOnly.toString());
    return this.http.get<ProvinciaResponseDto[]>(`${this.baseUrl}/provincias`, { params })
      .pipe(map(dtos => dtos.map(ProvinciaMapper.toEntity)));
  }

  /**
   * Crea una nueva provincia
   */
  createProvincia(dto: CreateProvinciaRequestDto): Observable<ProvinciaEntity> {
    return this.http.post<ProvinciaResponseDto>(`${this.baseUrl}/provincias`, dto)
      .pipe(map(ProvinciaMapper.toEntity));
  }

  /**
   * Actualiza una provincia existente
   */
  updateProvincia(id: number, dto: UpdateProvinciaRequestDto): Observable<ProvinciaEntity> {
    return this.http.put<ProvinciaResponseDto>(`${this.baseUrl}/provincias/${id}`, dto)
      .pipe(map(ProvinciaMapper.toEntity));
  }

  /**
   * Elimina (soft delete) una provincia
   */
  deleteProvincia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/provincias/${id}`);
  }

  // ==================== CANTONES ====================

  /**
   * Obtiene cantones de una provincia específica
   * @param provinciaCodigoSeps Código SEPS de la provincia (2 dígitos)
   * @param activeOnly Si es true, solo retorna cantones activos
   */
  getCantonesByProvincia(provinciaCodigoSeps: string, activeOnly: boolean = true): Observable<CantonEntity[]> {
    const params = new HttpParams().set('active', activeOnly.toString());
    return this.http.get<CantonResponseDto[]>(
      `${this.baseUrl}/provincias/${provinciaCodigoSeps}/cantones`, 
      { params }
    ).pipe(map(dtos => dtos.map(CantonMapper.toEntity)));
  }

  /**
   * Crea un nuevo cantón
   */
  createCanton(dto: CreateCantonRequestDto): Observable<CantonEntity> {
    return this.http.post<CantonResponseDto>(`${this.baseUrl}/cantones`, dto)
      .pipe(map(CantonMapper.toEntity));
  }

  /**
   * Actualiza un cantón existente
   */
  updateCanton(id: number, dto: UpdateCantonRequestDto): Observable<CantonEntity> {
    return this.http.put<CantonResponseDto>(`${this.baseUrl}/cantones/${id}`, dto)
      .pipe(map(CantonMapper.toEntity));
  }

  /**
   * Elimina (soft delete) un cantón
   */
  deleteCanton(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cantones/${id}`);
  }

  // ==================== PARROQUIAS ====================

  /**
   * Obtiene parroquias de un cantón específico
   * @param provinciaCodigoSeps Código SEPS de la provincia
   * @param cantonCodigoSeps Código SEPS del cantón
   * @param activeOnly Si es true, solo retorna parroquias activas
   */
  getParroquiasByCanton(
    provinciaCodigoSeps: string, 
    cantonCodigoSeps: string, 
    activeOnly: boolean = true
  ): Observable<ParroquiaEntity[]> {
    const params = new HttpParams().set('active', activeOnly.toString());
    return this.http.get<ParroquiaResponseDto[]>(
      `${this.baseUrl}/provincias/${provinciaCodigoSeps}/cantones/${cantonCodigoSeps}/parroquias`,
      { params }
    ).pipe(map(dtos => dtos.map(ParroquiaMapper.toEntity)));
  }

  /**
   * Busca parroquias por texto
   * @param query Texto a buscar
   * @param limit Límite de resultados (default 20)
   */
  searchParroquias(query: string, limit: number = 20): Observable<ParroquiaEntity[]> {
    const params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());
    return this.http.get<ParroquiaResponseDto[]>(`${this.baseUrl}/parroquias/search`, { params })
      .pipe(map(dtos => dtos.map(ParroquiaMapper.toEntity)));
  }

  /**
   * Crea una nueva parroquia
   */
  createParroquia(dto: CreateParroquiaRequestDto): Observable<ParroquiaEntity> {
    return this.http.post<ParroquiaResponseDto>(`${this.baseUrl}/parroquias`, dto)
      .pipe(map(ParroquiaMapper.toEntity));
  }

  /**
   * Actualiza una parroquia existente
   */
  updateParroquia(id: number, dto: UpdateParroquiaRequestDto): Observable<ParroquiaEntity> {
    return this.http.put<ParroquiaResponseDto>(`${this.baseUrl}/parroquias/${id}`, dto)
      .pipe(map(ParroquiaMapper.toEntity));
  }

  /**
   * Elimina (soft delete) una parroquia
   */
  deleteParroquia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/parroquias/${id}`);
  }
}
```

---

## DTOs

```typescript
// infrastructure/dto/response/provincia.response.dto.ts

/**
 * DTO de respuesta para Provincia (desde backend)
 */
export interface ProvinciaResponseDto {
  provi_cod_provi: number;
  provi_cod_prov: string;
  provi_nom_prov: string;
  provi_ctr_activo: boolean;
  provi_fec_creac: string;
  provi_fec_modif: string;
  provi_fec_elimi: string | null;
}
```

```typescript
// infrastructure/dto/response/canton.response.dto.ts

/**
 * DTO de respuesta para Cantón (desde backend)
 */
export interface CantonResponseDto {
  canto_cod_canto: number;
  provi_cod_provi: number;
  canto_cod_cant: string;
  canto_nom_cant: string;
  canto_ctr_activo: boolean;
  canto_fec_creac: string;
  canto_fec_modif: string;
  canto_fec_elimi: string | null;
  // Optional joined fields
  provi_cod_prov?: string;
  provi_nom_prov?: string;
}
```

```typescript
// infrastructure/dto/response/parroquia.response.dto.ts

/**
 * DTO de respuesta para Parroquia (desde backend)
 */
export interface ParroquiaResponseDto {
  parro_cod_parro: number;
  canto_cod_canto: number;
  parro_cod_parr: string;
  parro_nom_parr: string;
  parro_tip_area: 'R' | 'U' | null;
  parro_ctr_activo: boolean;
  parro_fec_creac: string;
  parro_fec_modif: string;
  parro_fec_elimi: string | null;
  // Optional joined fields
  canto_cod_cant?: string;
  canto_nom_cant?: string;
  provi_cod_prov?: string;
  provi_nom_prov?: string;
}
```

```typescript
// infrastructure/dto/request/create-provincia.request.dto.ts

/**
 * DTO para crear una provincia
 */
export interface CreateProvinciaRequestDto {
  provi_cod_prov: string;   // Código SEPS (2 dígitos)
  provi_nom_prov: string;   // Nombre
  provi_ctr_activo?: boolean;  // Default: true
}
```

```typescript
// infrastructure/dto/request/create-canton.request.dto.ts

/**
 * DTO para crear un cantón
 */
export interface CreateCantonRequestDto {
  provi_cod_provi: number;  // FK provincia (ID interno)
  canto_cod_cant: string;   // Código SEPS (2 dígitos)
  canto_nom_cant: string;   // Nombre
  canto_ctr_activo?: boolean;
}
```

```typescript
// infrastructure/dto/request/create-parroquia.request.dto.ts

/**
 * DTO para crear una parroquia
 */
export interface CreateParroquiaRequestDto {
  canto_cod_canto: number;  // FK cantón (ID interno)
  parro_cod_parr: string;   // Código SEPS (2 dígitos)
  parro_nom_parr: string;   // Nombre
  parro_tip_area?: 'R' | 'U' | null;  // Tipo área
  parro_ctr_activo?: boolean;
}
```

---

## MAPPERS

```typescript
// infrastructure/mappers/provincia.mapper.ts

import { ProvinciaResponseDto } from '../dto/response/provincia.response.dto';
import { ProvinciaEntity } from '../../domain/entities/provincia.entity';

/**
 * Mapper para convertir entre DTO y Entity de Provincia
 */
export class ProvinciaMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: ProvinciaResponseDto): ProvinciaEntity {
    return {
      id: dto.provi_cod_provi,
      codigoSeps: dto.provi_cod_prov,
      nombre: dto.provi_nom_prov,
      activo: dto.provi_ctr_activo,
      fechaCreacion: new Date(dto.provi_fec_creac),
      fechaModificacion: new Date(dto.provi_fec_modif),
      fechaEliminacion: dto.provi_fec_elimi ? new Date(dto.provi_fec_elimi) : null,
    };
  }
}
```

```typescript
// infrastructure/mappers/canton.mapper.ts

import { CantonResponseDto } from '../dto/response/canton.response.dto';
import { CantonEntity } from '../../domain/entities/canton.entity';

/**
 * Mapper para convertir entre DTO y Entity de Cantón
 */
export class CantonMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: CantonResponseDto): CantonEntity {
    return {
      id: dto.canto_cod_canto,
      provinciaId: dto.provi_cod_provi,
      codigoSeps: dto.canto_cod_cant,
      nombre: dto.canto_nom_cant,
      activo: dto.canto_ctr_activo,
      fechaCreacion: new Date(dto.canto_fec_creac),
      fechaModificacion: new Date(dto.canto_fec_modif),
      fechaEliminacion: dto.canto_fec_elimi ? new Date(dto.canto_fec_elimi) : null,
      provinciaCodigoSeps: dto.provi_cod_prov,
      provinciaNombre: dto.provi_nom_prov,
    };
  }
}
```

```typescript
// infrastructure/mappers/parroquia.mapper.ts

import { ParroquiaResponseDto } from '../dto/response/parroquia.response.dto';
import { ParroquiaEntity, generarCodigoCompleto } from '../../domain/entities/parroquia.entity';

/**
 * Mapper para convertir entre DTO y Entity de Parroquia
 */
export class ParroquiaMapper {
  /**
   * Convierte DTO de respuesta a Entity de dominio
   */
  static toEntity(dto: ParroquiaResponseDto): ParroquiaEntity {
    const codigoCompleto = dto.provi_cod_prov && dto.canto_cod_cant && dto.parro_cod_parr
      ? generarCodigoCompleto(dto.provi_cod_prov, dto.canto_cod_cant, dto.parro_cod_parr)
      : undefined;

    return {
      id: dto.parro_cod_parro,
      cantonId: dto.canto_cod_canto,
      codigoSeps: dto.parro_cod_parr,
      nombre: dto.parro_nom_parr,
      tipoArea: dto.parro_tip_area,
      activo: dto.parro_ctr_activo,
      fechaCreacion: new Date(dto.parro_fec_creac),
      fechaModificacion: new Date(dto.parro_fec_modif),
      fechaEliminacion: dto.parro_fec_elimi ? new Date(dto.parro_fec_elimi) : null,
      cantonCodigoSeps: dto.canto_cod_cant,
      cantonNombre: dto.canto_nom_cant,
      provinciaCodigoSeps: dto.provi_cod_prov,
      provinciaNombre: dto.provi_nom_prov,
      codigoCompleto,
    };
  }
}
```

---

## STATE MANAGEMENT

```typescript
// infrastructure/state/geo.state.ts

import { signal, computed } from '@angular/core';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from '../../domain/entities';

/**
 * Estado del módulo Geo usando Signals
 */
export interface GeoState {
  // Data
  provincias: ProvinciaEntity[];
  cantones: CantonEntity[];
  parroquias: ParroquiaEntity[];
  searchResults: ParroquiaEntity[];
  
  // Selection
  selectedProvincia: ProvinciaEntity | null;
  selectedCanton: CantonEntity | null;
  selectedParroquia: ParroquiaEntity | null;
  
  // UI State
  loading: boolean;
  loadingCantones: boolean;
  loadingParroquias: boolean;
  error: string | null;
  
  // Filters
  showInactive: boolean;
}

/**
 * Estado inicial
 */
export const initialGeoState: GeoState = {
  provincias: [],
  cantones: [],
  parroquias: [],
  searchResults: [],
  selectedProvincia: null,
  selectedCanton: null,
  selectedParroquia: null,
  loading: false,
  loadingCantones: false,
  loadingParroquias: false,
  error: null,
  showInactive: false,
};

/**
 * Signals para el estado del módulo
 */
export const geoState = signal<GeoState>(initialGeoState);

/**
 * Computed signals para datos derivados
 */
export const provinciasActivas = computed(() => 
  geoState().provincias.filter(p => p.activo)
);

export const cantonesActivos = computed(() => 
  geoState().cantones.filter(c => c.activo)
);

export const parroquiasActivas = computed(() => 
  geoState().parroquias.filter(p => p.activo)
);

/**
 * Helper para actualizar el estado
 */
export function updateGeoState(partial: Partial<GeoState>): void {
  geoState.update(state => ({ ...state, ...partial }));
}
```

---

## FACADE

```typescript
// application/facades/geo.facade.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GeoAdapter } from '../../infrastructure/adapters/geo.adapter';
import { 
  ProvinciaEntity, 
  CantonEntity, 
  ParroquiaEntity 
} from '../../domain/entities';
import {
  CreateProvinciaRequestDto,
  UpdateProvinciaRequestDto,
  CreateCantonRequestDto,
  UpdateCantonRequestDto,
  CreateParroquiaRequestDto,
  UpdateParroquiaRequestDto,
} from '../../infrastructure/dto/request';

/**
 * Facade para el módulo de Catálogo Geográfico
 * Gestiona el estado y orquesta las operaciones
 */
@Injectable({ providedIn: 'root' })
export class GeoFacade {
  private readonly adapter = inject(GeoAdapter);

  // ==================== STATE ====================
  
  // Data signals
  private readonly _provincias = signal<ProvinciaEntity[]>([]);
  private readonly _cantones = signal<CantonEntity[]>([]);
  private readonly _parroquias = signal<ParroquiaEntity[]>([]);
  private readonly _searchResults = signal<ParroquiaEntity[]>([]);
  
  // Selection signals
  private readonly _selectedProvincia = signal<ProvinciaEntity | null>(null);
  private readonly _selectedCanton = signal<CantonEntity | null>(null);
  
  // UI state signals
  private readonly _loading = signal<boolean>(false);
  private readonly _loadingCantones = signal<boolean>(false);
  private readonly _loadingParroquias = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _showInactive = signal<boolean>(false);

  // ==================== PUBLIC SELECTORS ====================
  
  /** Lista de provincias */
  readonly provincias = this._provincias.asReadonly();
  
  /** Lista de cantones del provincia seleccionada */
  readonly cantones = this._cantones.asReadonly();
  
  /** Lista de parroquias del cantón seleccionado */
  readonly parroquias = this._parroquias.asReadonly();
  
  /** Resultados de búsqueda de parroquias */
  readonly searchResults = this._searchResults.asReadonly();
  
  /** Provincia seleccionada */
  readonly selectedProvincia = this._selectedProvincia.asReadonly();
  
  /** Cantón seleccionado */
  readonly selectedCanton = this._selectedCanton.asReadonly();
  
  /** Estado de carga general */
  readonly loading = this._loading.asReadonly();
  
  /** Estado de carga de cantones */
  readonly loadingCantones = this._loadingCantones.asReadonly();
  
  /** Estado de carga de parroquias */
  readonly loadingParroquias = this._loadingParroquias.asReadonly();
  
  /** Error actual */
  readonly error = this._error.asReadonly();
  
  /** Mostrar inactivos */
  readonly showInactive = this._showInactive.asReadonly();

  // ==================== COMPUTED ====================
  
  /** Provincias filtradas (activas o todas) */
  readonly provinciasFiltradas = computed(() => {
    const showInactive = this._showInactive();
    return this._provincias().filter(p => showInactive || p.activo);
  });

  /** Cantones filtrados */
  readonly cantonesFiltrados = computed(() => {
    const showInactive = this._showInactive();
    return this._cantones().filter(c => showInactive || c.activo);
  });

  /** Parroquias filtradas */
  readonly parroquiasFiltradas = computed(() => {
    const showInactive = this._showInactive();
    return this._parroquias().filter(p => showInactive || p.activo);
  });

  // ==================== ACTIONS ====================

  /**
   * Carga las provincias
   */
  async loadProvincias(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    
    try {
      const provincias = await firstValueFrom(
        this.adapter.getProvincias(!this._showInactive())
      );
      this._provincias.set(provincias);
    } catch (error) {
      this._error.set('Error al cargar las provincias');
      console.error('Error loading provincias:', error);
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Selecciona una provincia y carga sus cantones
   */
  async selectProvincia(provincia: ProvinciaEntity | null): Promise<void> {
    this._selectedProvincia.set(provincia);
    this._selectedCanton.set(null);
    this._cantones.set([]);
    this._parroquias.set([]);
    
    if (provincia) {
      await this.loadCantones(provincia.codigoSeps);
    }
  }

  /**
   * Carga los cantones de una provincia
   */
  async loadCantones(provinciaCodigoSeps: string): Promise<void> {
    this._loadingCantones.set(true);
    this._error.set(null);
    
    try {
      const cantones = await firstValueFrom(
        this.adapter.getCantonesByProvincia(provinciaCodigoSeps, !this._showInactive())
      );
      this._cantones.set(cantones);
    } catch (error) {
      this._error.set('Error al cargar los cantones');
      console.error('Error loading cantones:', error);
    } finally {
      this._loadingCantones.set(false);
    }
  }

  /**
   * Selecciona un cantón y carga sus parroquias
   */
  async selectCanton(canton: CantonEntity | null): Promise<void> {
    this._selectedCanton.set(canton);
    this._parroquias.set([]);
    
    if (canton && this._selectedProvincia()) {
      await this.loadParroquias(
        this._selectedProvincia()!.codigoSeps,
        canton.codigoSeps
      );
    }
  }

  /**
   * Carga las parroquias de un cantón
   */
  async loadParroquias(provinciaCodigoSeps: string, cantonCodigoSeps: string): Promise<void> {
    this._loadingParroquias.set(true);
    this._error.set(null);
    
    try {
      const parroquias = await firstValueFrom(
        this.adapter.getParroquiasByCanton(
          provinciaCodigoSeps, 
          cantonCodigoSeps, 
          !this._showInactive()
        )
      );
      this._parroquias.set(parroquias);
    } catch (error) {
      this._error.set('Error al cargar las parroquias');
      console.error('Error loading parroquias:', error);
    } finally {
      this._loadingParroquias.set(false);
    }
  }

  /**
   * Busca parroquias por texto
   */
  async searchParroquias(query: string): Promise<void> {
    if (!query || query.length < 2) {
      this._searchResults.set([]);
      return;
    }
    
    try {
      const results = await firstValueFrom(
        this.adapter.searchParroquias(query)
      );
      this._searchResults.set(results);
    } catch (error) {
      console.error('Error searching parroquias:', error);
    }
  }

  /**
   * Alterna mostrar/ocultar inactivos
   */
  toggleShowInactive(): void {
    this._showInactive.update(v => !v);
  }

  // ==================== CRUD PROVINCIAS ====================

  /**
   * Crea una nueva provincia
   */
  async createProvincia(dto: CreateProvinciaRequestDto): Promise<ProvinciaEntity> {
    const created = await firstValueFrom(this.adapter.createProvincia(dto));
    this._provincias.update(list => [...list, created]);
    return created;
  }

  /**
   * Actualiza una provincia
   */
  async updateProvincia(id: number, dto: UpdateProvinciaRequestDto): Promise<ProvinciaEntity> {
    const updated = await firstValueFrom(this.adapter.updateProvincia(id, dto));
    this._provincias.update(list => 
      list.map(p => p.id === id ? updated : p)
    );
    return updated;
  }

  /**
   * Elimina una provincia (soft delete)
   */
  async deleteProvincia(id: number): Promise<void> {
    await firstValueFrom(this.adapter.deleteProvincia(id));
    this._provincias.update(list => list.filter(p => p.id !== id));
    
    // Clear selection if deleted
    if (this._selectedProvincia()?.id === id) {
      this._selectedProvincia.set(null);
      this._cantones.set([]);
      this._parroquias.set([]);
    }
  }

  // ==================== CRUD CANTONES ====================

  /**
   * Crea un nuevo cantón
   */
  async createCanton(dto: CreateCantonRequestDto): Promise<CantonEntity> {
    const created = await firstValueFrom(this.adapter.createCanton(dto));
    this._cantones.update(list => [...list, created]);
    return created;
  }

  /**
   * Actualiza un cantón
   */
  async updateCanton(id: number, dto: UpdateCantonRequestDto): Promise<CantonEntity> {
    const updated = await firstValueFrom(this.adapter.updateCanton(id, dto));
    this._cantones.update(list => 
      list.map(c => c.id === id ? updated : c)
    );
    return updated;
  }

  /**
   * Elimina un cantón (soft delete)
   */
  async deleteCanton(id: number): Promise<void> {
    await firstValueFrom(this.adapter.deleteCanton(id));
    this._cantones.update(list => list.filter(c => c.id !== id));
    
    if (this._selectedCanton()?.id === id) {
      this._selectedCanton.set(null);
      this._parroquias.set([]);
    }
  }

  // ==================== CRUD PARROQUIAS ====================

  /**
   * Crea una nueva parroquia
   */
  async createParroquia(dto: CreateParroquiaRequestDto): Promise<ParroquiaEntity> {
    const created = await firstValueFrom(this.adapter.createParroquia(dto));
    this._parroquias.update(list => [...list, created]);
    return created;
  }

  /**
   * Actualiza una parroquia
   */
  async updateParroquia(id: number, dto: UpdateParroquiaRequestDto): Promise<ParroquiaEntity> {
    const updated = await firstValueFrom(this.adapter.updateParroquia(id, dto));
    this._parroquias.update(list => 
      list.map(p => p.id === id ? updated : p)
    );
    return updated;
  }

  /**
   * Elimina una parroquia (soft delete)
   */
  async deleteParroquia(id: number): Promise<void> {
    await firstValueFrom(this.adapter.deleteParroquia(id));
    this._parroquias.update(list => list.filter(p => p.id !== id));
  }

  // ==================== RESET ====================

  /**
   * Limpia el estado del módulo
   */
  reset(): void {
    this._provincias.set([]);
    this._cantones.set([]);
    this._parroquias.set([]);
    this._searchResults.set([]);
    this._selectedProvincia.set(null);
    this._selectedCanton.set(null);
    this._loading.set(false);
    this._loadingCantones.set(false);
    this._loadingParroquias.set(false);
    this._error.set(null);
  }
}
```

---

## MAIN VIEW COMPONENT

```typescript
// interface/views/geo-catalog/geo-catalog.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GeoFacade } from '../../../application/facades/geo.facade';
import { ProvinciaEntity, CantonEntity, ParroquiaEntity } from '../../../domain/entities';
import { ProvinciaDialogComponent } from '../components/provincia-dialog/provincia-dialog.component';
import { CantonDialogComponent } from '../components/canton-dialog/canton-dialog.component';
import { ParroquiaDialogComponent } from '../components/parroquia-dialog/parroquia-dialog.component';

/**
 * Componente principal para gestión del Catálogo Geográfico
 * Vista jerárquica: Provincia > Cantón > Parroquia
 */
@Component({
  selector: 'app-geo-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  templateUrl: './geo-catalog.component.html',
  styleUrls: ['./geo-catalog.component.scss'],
})
export class GeoCatalogComponent implements OnInit {
  private readonly facade = inject(GeoFacade);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Exposed signals from facade
  readonly provincias = this.facade.provinciasFiltradas;
  readonly cantones = this.facade.cantonesFiltrados;
  readonly parroquias = this.facade.parroquiasFiltradas;
  readonly selectedProvincia = this.facade.selectedProvincia;
  readonly selectedCanton = this.facade.selectedCanton;
  readonly loading = this.facade.loading;
  readonly loadingCantones = this.facade.loadingCantones;
  readonly loadingParroquias = this.facade.loadingParroquias;
  readonly showInactive = this.facade.showInactive;

  // Table columns
  readonly provinciaColumns = ['codigoSeps', 'nombre', 'activo', 'acciones'];
  readonly cantonColumns = ['codigoSeps', 'nombre', 'activo', 'acciones'];
  readonly parroquiaColumns = ['codigoSeps', 'nombre', 'tipoArea', 'activo', 'acciones'];

  ngOnInit(): void {
    this.facade.loadProvincias();
  }

  // ==================== SELECTION ====================

  onSelectProvincia(provincia: ProvinciaEntity): void {
    this.facade.selectProvincia(provincia);
  }

  onSelectCanton(canton: CantonEntity): void {
    this.facade.selectCanton(canton);
  }

  // ==================== TOGGLE INACTIVE ====================

  onToggleInactive(): void {
    this.facade.toggleShowInactive();
    this.facade.loadProvincias();
  }

  // ==================== PROVINCIA CRUD ====================

  openProvinciaDialog(provincia?: ProvinciaEntity): void {
    const dialogRef = this.dialog.open(ProvinciaDialogComponent, {
      width: '500px',
      data: { 
        mode: provincia ? 'edit' : 'create',
        provincia 
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMessage(
          provincia ? 'Provincia actualizada correctamente' : 'Provincia creada correctamente'
        );
      }
    });
  }

  async onDeleteProvincia(provincia: ProvinciaEntity): Promise<void> {
    if (confirm(`¿Está seguro de eliminar la provincia "${provincia.nombre}"?`)) {
      try {
        await this.facade.deleteProvincia(provincia.id);
        this.showMessage('Provincia eliminada correctamente');
      } catch (error) {
        this.showMessage('Error al eliminar la provincia', true);
      }
    }
  }

  // ==================== CANTON CRUD ====================

  openCantonDialog(canton?: CantonEntity): void {
    const selectedProvincia = this.selectedProvincia();
    if (!selectedProvincia && !canton) {
      this.showMessage('Seleccione una provincia primero', true);
      return;
    }

    const dialogRef = this.dialog.open(CantonDialogComponent, {
      width: '500px',
      data: { 
        mode: canton ? 'edit' : 'create',
        canton,
        provincia: selectedProvincia,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMessage(
          canton ? 'Cantón actualizado correctamente' : 'Cantón creado correctamente'
        );
      }
    });
  }

  async onDeleteCanton(canton: CantonEntity): Promise<void> {
    if (confirm(`¿Está seguro de eliminar el cantón "${canton.nombre}"?`)) {
      try {
        await this.facade.deleteCanton(canton.id);
        this.showMessage('Cantón eliminado correctamente');
      } catch (error) {
        this.showMessage('Error al eliminar el cantón', true);
      }
    }
  }

  // ==================== PARROQUIA CRUD ====================

  openParroquiaDialog(parroquia?: ParroquiaEntity): void {
    const selectedCanton = this.selectedCanton();
    if (!selectedCanton && !parroquia) {
      this.showMessage('Seleccione un cantón primero', true);
      return;
    }

    const dialogRef = this.dialog.open(ParroquiaDialogComponent, {
      width: '500px',
      data: { 
        mode: parroquia ? 'edit' : 'create',
        parroquia,
        canton: selectedCanton,
        provincia: this.selectedProvincia(),
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMessage(
          parroquia ? 'Parroquia actualizada correctamente' : 'Parroquia creada correctamente'
        );
      }
    });
  }

  async onDeleteParroquia(parroquia: ParroquiaEntity): Promise<void> {
    if (confirm(`¿Está seguro de eliminar la parroquia "${parroquia.nombre}"?`)) {
      try {
        await this.facade.deleteParroquia(parroquia.id);
        this.showMessage('Parroquia eliminada correctamente');
      } catch (error) {
        this.showMessage('Error al eliminar la parroquia', true);
      }
    }
  }

  // ==================== HELPERS ====================

  private showMessage(message: string, isError: boolean = false): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? 'snackbar-error' : 'snackbar-success',
    });
  }

  /**
   * Obtiene descripción del tipo de área
   */
  getTipoAreaLabel(tipo: 'R' | 'U' | null): string {
    switch (tipo) {
      case 'U': return 'Urbana';
      case 'R': return 'Rural';
      default: return '-';
    }
  }
}
```

---

## MAIN VIEW TEMPLATE

```html
<!-- interface/views/geo-catalog/geo-catalog.component.html -->

<div class="geo-catalog-container">
  <!-- Header -->
  <div class="header flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold">Catálogo Geográfico</h1>
      <p class="text-gray-500">Gestión de Provincias, Cantones y Parroquias</p>
    </div>
    
    <div class="flex items-center gap-4">
      <mat-slide-toggle 
        [checked]="showInactive()"
        (change)="onToggleInactive()">
        Mostrar inactivos
      </mat-slide-toggle>
    </div>
  </div>

  <!-- Breadcrumb -->
  <div class="breadcrumb flex items-center gap-2 mb-4 text-sm">
    <span 
      class="cursor-pointer hover:text-primary"
      [class.font-bold]="!selectedProvincia()"
      (click)="facade.selectProvincia(null)">
      Provincias
    </span>
    
    @if (selectedProvincia()) {
      <mat-icon class="text-gray-400">chevron_right</mat-icon>
      <span 
        class="cursor-pointer hover:text-primary"
        [class.font-bold]="selectedProvincia() && !selectedCanton()">
        {{ selectedProvincia()!.nombre }}
      </span>
    }
    
    @if (selectedCanton()) {
      <mat-icon class="text-gray-400">chevron_right</mat-icon>
      <span class="font-bold">
        {{ selectedCanton()!.nombre }}
      </span>
    }
  </div>

  <!-- Content Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    <!-- PROVINCIAS -->
    <mat-card class="overflow-hidden">
      <mat-card-header class="bg-gray-50 px-4 py-3">
        <mat-card-title class="text-lg flex justify-between items-center w-full">
          <span>Provincias</span>
          <button mat-icon-button color="primary" (click)="openProvinciaDialog()">
            <mat-icon>add</mat-icon>
          </button>
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content class="p-0">
        @if (loading()) {
          <div class="flex justify-center p-8">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div class="max-h-96 overflow-auto">
            @for (provincia of provincias(); track provincia.id) {
              <div 
                class="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                [class.bg-primary-50]="selectedProvincia()?.id === provincia.id"
                (click)="onSelectProvincia(provincia)">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                    {{ provincia.codigoSeps }}
                  </span>
                  <span [class.text-gray-400]="!provincia.activo">
                    {{ provincia.nombre }}
                  </span>
                  @if (!provincia.activo) {
                    <mat-chip class="text-xs">Inactivo</mat-chip>
                  }
                </div>
                
                <div class="flex gap-1">
                  <button mat-icon-button (click)="openProvinciaDialog(provincia); $event.stopPropagation()">
                    <mat-icon class="text-sm">edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onDeleteProvincia(provincia); $event.stopPropagation()">
                    <mat-icon class="text-sm">delete</mat-icon>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-gray-500">
                No hay provincias registradas
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>

    <!-- CANTONES -->
    <mat-card class="overflow-hidden">
      <mat-card-header class="bg-gray-50 px-4 py-3">
        <mat-card-title class="text-lg flex justify-between items-center w-full">
          <span>Cantones</span>
          <button 
            mat-icon-button 
            color="primary" 
            [disabled]="!selectedProvincia()"
            (click)="openCantonDialog()">
            <mat-icon>add</mat-icon>
          </button>
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content class="p-0">
        @if (!selectedProvincia()) {
          <div class="p-8 text-center text-gray-500">
            Seleccione una provincia
          </div>
        } @else if (loadingCantones()) {
          <div class="flex justify-center p-8">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div class="max-h-96 overflow-auto">
            @for (canton of cantones(); track canton.id) {
              <div 
                class="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                [class.bg-primary-50]="selectedCanton()?.id === canton.id"
                (click)="onSelectCanton(canton)">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                    {{ canton.codigoSeps }}
                  </span>
                  <span [class.text-gray-400]="!canton.activo">
                    {{ canton.nombre }}
                  </span>
                  @if (!canton.activo) {
                    <mat-chip class="text-xs">Inactivo</mat-chip>
                  }
                </div>
                
                <div class="flex gap-1">
                  <button mat-icon-button (click)="openCantonDialog(canton); $event.stopPropagation()">
                    <mat-icon class="text-sm">edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onDeleteCanton(canton); $event.stopPropagation()">
                    <mat-icon class="text-sm">delete</mat-icon>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-gray-500">
                No hay cantones en esta provincia
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>

    <!-- PARROQUIAS -->
    <mat-card class="overflow-hidden">
      <mat-card-header class="bg-gray-50 px-4 py-3">
        <mat-card-title class="text-lg flex justify-between items-center w-full">
          <span>Parroquias</span>
          <button 
            mat-icon-button 
            color="primary" 
            [disabled]="!selectedCanton()"
            (click)="openParroquiaDialog()">
            <mat-icon>add</mat-icon>
          </button>
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content class="p-0">
        @if (!selectedCanton()) {
          <div class="p-8 text-center text-gray-500">
            Seleccione un cantón
          </div>
        } @else if (loadingParroquias()) {
          <div class="flex justify-center p-8">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div class="max-h-96 overflow-auto">
            @for (parroquia of parroquias(); track parroquia.id) {
              <div class="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                    {{ parroquia.codigoSeps }}
                  </span>
                  <span [class.text-gray-400]="!parroquia.activo">
                    {{ parroquia.nombre }}
                  </span>
                  @if (parroquia.tipoArea) {
                    <mat-chip 
                      class="text-xs"
                      [class.bg-blue-100]="parroquia.tipoArea === 'U'"
                      [class.bg-green-100]="parroquia.tipoArea === 'R'">
                      {{ getTipoAreaLabel(parroquia.tipoArea) }}
                    </mat-chip>
                  }
                  @if (!parroquia.activo) {
                    <mat-chip class="text-xs bg-gray-200">Inactivo</mat-chip>
                  }
                </div>
                
                <div class="flex gap-1">
                  <button mat-icon-button (click)="openParroquiaDialog(parroquia)">
                    <mat-icon class="text-sm">edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onDeleteParroquia(parroquia)">
                    <mat-icon class="text-sm">delete</mat-icon>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-gray-500">
                No hay parroquias en este cantón
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  </div>
</div>
```

---

## CASCADING SELECT COMPONENT (REUSABLE)

```typescript
// interface/views/components/cascading-select/cascading-select.component.ts

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  inject, 
  signal,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  FormsModule 
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GeoAdapter } from '../../../../infrastructure/adapters/geo.adapter';
import { 
  ProvinciaEntity, 
  CantonEntity, 
  ParroquiaEntity 
} from '../../../../domain/entities';

export interface ParroquiaSeleccionada {
  parroquiaId: number;
  provinciaCodigoSeps: string;
  cantonCodigoSeps: string;
  parroquiaCodigoSeps: string;
  codigoCompleto: string;
  nombre: string;
  tipoArea: 'R' | 'U' | null;
}

/**
 * Componente reutilizable para selección en cascada de División Política
 * 
 * Uso:
 * <app-cascading-select
 *   [(ngModel)]="parroquiaId"
 *   (selectionChange)="onParroquiaSelected($event)">
 * </app-cascading-select>
 * 
 * O con Reactive Forms:
 * <app-cascading-select formControlName="parroquiaId">
 * </app-cascading-select>
 */
@Component({
  selector: 'app-cascading-select',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CascadingSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="cascading-select flex flex-col md:flex-row gap-4">
      <!-- Provincia -->
      <mat-form-field class="flex-1" appearance="outline">
        <mat-label>Provincia</mat-label>
        <mat-select 
          [value]="selectedProvinciaId()"
          (selectionChange)="onProvinciaChange($event.value)"
          [disabled]="disabled()">
          @for (provincia of provincias(); track provincia.id) {
            <mat-option [value]="provincia.id">
              {{ provincia.codigoSeps }} - {{ provincia.nombre }}
            </mat-option>
          }
        </mat-select>
        @if (loadingProvincias()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        }
      </mat-form-field>

      <!-- Cantón -->
      <mat-form-field class="flex-1" appearance="outline">
        <mat-label>Cantón</mat-label>
        <mat-select 
          [value]="selectedCantonId()"
          (selectionChange)="onCantonChange($event.value)"
          [disabled]="disabled() || !selectedProvinciaId()">
          @for (canton of cantones(); track canton.id) {
            <mat-option [value]="canton.id">
              {{ canton.codigoSeps }} - {{ canton.nombre }}
            </mat-option>
          }
        </mat-select>
        @if (loadingCantones()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        }
      </mat-form-field>

      <!-- Parroquia -->
      <mat-form-field class="flex-1" appearance="outline">
        <mat-label>Parroquia</mat-label>
        <mat-select 
          [value]="selectedParroquiaId()"
          (selectionChange)="onParroquiaChange($event.value)"
          [disabled]="disabled() || !selectedCantonId()">
          @for (parroquia of parroquias(); track parroquia.id) {
            <mat-option [value]="parroquia.id">
              {{ parroquia.codigoSeps }} - {{ parroquia.nombre }}
              @if (parroquia.tipoArea) {
                <span class="text-xs text-gray-500 ml-2">
                  ({{ parroquia.tipoArea === 'U' ? 'Urbana' : 'Rural' }})
                </span>
              }
            </mat-option>
          }
        </mat-select>
        @if (loadingParroquias()) {
          <mat-spinner matSuffix diameter="20"></mat-spinner>
        }
      </mat-form-field>
    </div>
  `,
  styles: [`
    .cascading-select {
      width: 100%;
    }
  `],
})
export class CascadingSelectComponent implements OnInit, ControlValueAccessor {
  private readonly adapter = inject(GeoAdapter);

  // Inputs
  @Input() showInactive = false;
  
  // Outputs
  @Output() selectionChange = new EventEmitter<ParroquiaSeleccionada | null>();

  // Data signals
  readonly provincias = signal<ProvinciaEntity[]>([]);
  readonly cantones = signal<CantonEntity[]>([]);
  readonly parroquias = signal<ParroquiaEntity[]>([]);

  // Selection signals
  readonly selectedProvinciaId = signal<number | null>(null);
  readonly selectedCantonId = signal<number | null>(null);
  readonly selectedParroquiaId = signal<number | null>(null);

  // Loading signals
  readonly loadingProvincias = signal<boolean>(false);
  readonly loadingCantones = signal<boolean>(false);
  readonly loadingParroquias = signal<boolean>(false);

  // Disabled state
  readonly disabled = signal<boolean>(false);

  // ControlValueAccessor callbacks
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.loadProvincias();
  }

  // ==================== DATA LOADING ====================

  private async loadProvincias(): Promise<void> {
    this.loadingProvincias.set(true);
    try {
      this.adapter.getProvincias(!this.showInactive).subscribe(provincias => {
        this.provincias.set(provincias);
        this.loadingProvincias.set(false);
      });
    } catch (error) {
      console.error('Error loading provincias:', error);
      this.loadingProvincias.set(false);
    }
  }

  private async loadCantones(provinciaCodigoSeps: string): Promise<void> {
    this.loadingCantones.set(true);
    try {
      this.adapter.getCantonesByProvincia(provinciaCodigoSeps, !this.showInactive)
        .subscribe(cantones => {
          this.cantones.set(cantones);
          this.loadingCantones.set(false);
        });
    } catch (error) {
      console.error('Error loading cantones:', error);
      this.loadingCantones.set(false);
    }
  }

  private async loadParroquias(provinciaCodigoSeps: string, cantonCodigoSeps: string): Promise<void> {
    this.loadingParroquias.set(true);
    try {
      this.adapter.getParroquiasByCanton(provinciaCodigoSeps, cantonCodigoSeps, !this.showInactive)
        .subscribe(parroquias => {
          this.parroquias.set(parroquias);
          this.loadingParroquias.set(false);
        });
    } catch (error) {
      console.error('Error loading parroquias:', error);
      this.loadingParroquias.set(false);
    }
  }

  // ==================== SELECTION HANDLERS ====================

  onProvinciaChange(provinciaId: number): void {
    this.selectedProvinciaId.set(provinciaId);
    this.selectedCantonId.set(null);
    this.selectedParroquiaId.set(null);
    this.cantones.set([]);
    this.parroquias.set([]);
    
    const provincia = this.provincias().find(p => p.id === provinciaId);
    if (provincia) {
      this.loadCantones(provincia.codigoSeps);
    }
    
    this.emitChange(null);
  }

  onCantonChange(cantonId: number): void {
    this.selectedCantonId.set(cantonId);
    this.selectedParroquiaId.set(null);
    this.parroquias.set([]);
    
    const provincia = this.provincias().find(p => p.id === this.selectedProvinciaId());
    const canton = this.cantones().find(c => c.id === cantonId);
    
    if (provincia && canton) {
      this.loadParroquias(provincia.codigoSeps, canton.codigoSeps);
    }
    
    this.emitChange(null);
  }

  onParroquiaChange(parroquiaId: number): void {
    this.selectedParroquiaId.set(parroquiaId);
    
    const parroquia = this.parroquias().find(p => p.id === parroquiaId);
    const canton = this.cantones().find(c => c.id === this.selectedCantonId());
    const provincia = this.provincias().find(p => p.id === this.selectedProvinciaId());
    
    if (parroquia && canton && provincia) {
      const seleccion: ParroquiaSeleccionada = {
        parroquiaId: parroquia.id,
        provinciaCodigoSeps: provincia.codigoSeps,
        cantonCodigoSeps: canton.codigoSeps,
        parroquiaCodigoSeps: parroquia.codigoSeps,
        codigoCompleto: `${provincia.codigoSeps}${canton.codigoSeps}${parroquia.codigoSeps}`,
        nombre: parroquia.nombre,
        tipoArea: parroquia.tipoArea,
      };
      this.emitChange(parroquiaId);
      this.selectionChange.emit(seleccion);
    }
  }

  private emitChange(value: number | null): void {
    this.onChange(value);
    this.onTouched();
  }

  // ==================== ControlValueAccessor ====================

  writeValue(value: number | null): void {
    if (value) {
      this.selectedParroquiaId.set(value);
      // TODO: Load hierarchy from parroquia ID if needed
    } else {
      this.selectedProvinciaId.set(null);
      this.selectedCantonId.set(null);
      this.selectedParroquiaId.set(null);
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
```

---

## ROUTES CONFIGURATION

```typescript
// geo.routes.ts

import { Routes } from '@angular/router';
import { GeoCatalogComponent } from './interface/views/geo-catalog/geo-catalog.component';

export const GEO_ROUTES: Routes = [
  {
    path: '',
    component: GeoCatalogComponent,
    data: {
      title: 'Catálogo Geográfico',
      breadcrumb: 'Catálogo Geográfico',
    },
  },
];
```

---

## MODULE CONFIGURATION

```typescript
// geo.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GEO_ROUTES } from './geo.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(GEO_ROUTES),
  ],
})
export class GeoModule {}
```

---

## NAVIGATION MENU INTEGRATION

```typescript
// Add to navigation configuration (e.g., app/core/navigation/navigation.ts)

{
  id: 'configuracion.geo',
  title: 'Catálogo Geográfico',
  type: 'basic',
  icon: 'heroicons_outline:map',
  link: '/configuracion/catalogo-geografico',
  // Requires admin role
  // hidden: (item) => !this.authService.hasRole('ADMIN'),
}
```

---

## IMPLEMENTATION CHECKLIST

```sudolang
Checklist {
  domain {
    [ ] ProvinciaEntity interface
    [ ] CantonEntity interface
    [ ] ParroquiaEntity interface
    [ ] Helper functions (generarCodigoCompleto, getDescripcionTipoArea)
  }
  
  infrastructure {
    [ ] GeoAdapter with all HTTP methods
    [ ] Request DTOs (create/update for each entity)
    [ ] Response DTOs matching backend
    [ ] Mappers (Provincia, Canton, Parroquia)
    [ ] State definition with signals
  }
  
  application {
    [ ] GeoFacade with state management
    [ ] All CRUD operations
    [ ] Selection handlers
    [ ] Search functionality
  }
  
  interface {
    [ ] GeoCatalogComponent (main view)
    [ ] ProvinciaDialogComponent
    [ ] CantonDialogComponent
    [ ] ParroquiaDialogComponent
    [ ] CascadingSelectComponent (reusable)
  }
  
  configuration {
    [ ] geo.routes.ts
    [ ] geo.module.ts
    [ ] Navigation menu entry
    [ ] Environment API URL
  }
  
  styling {
    [ ] Tailwind utility classes
    [ ] Material components
    [ ] Responsive grid layout
    [ ] Loading states
    [ ] Empty states
  }
}
```

---

## START IMPLEMENTATION

Begin with Phase 1: Create the domain entities and infrastructure adapters.

1. Create `domain/entities/provincia.entity.ts`
2. Create `domain/entities/canton.entity.ts`
3. Create `domain/entities/parroquia.entity.ts`
4. Create `infrastructure/dto/response/` DTOs
5. Create `infrastructure/mappers/` for each entity
6. Create `infrastructure/adapters/geo.adapter.ts`

Then proceed to the Facade and UI components.

---

## REFERENCES

- `.cursorrules` - Project coding conventions and patterns
- `template_crud_core.md` - Hexagonal architecture template
- `IMPLEMENTACION-GEO-RESUMEN.md` - Backend implementation reference
