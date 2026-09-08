/**
 * Puerto de escritura del catálogo (back-office). La lectura pública vive en
 * `catalog.repository.ts`: son dos proyecciones distintas del mismo modelo y
 * mantenerlas separadas evita que un campo interno se cuele en la vista del visitante.
 */

/** Vista completa de un Set, para quien tiene acceso al back-office. */
export interface ManagedSet {
  id: string;
  setNum: string | null;
  themeId: string;
  name: string;
  year: number | null;
  pieceCount: number;
  recommendedAge: string | null;
  difficulty: string | null;
  /** Decimal como cadena, para no perder exactitud en el viaje. */
  referenceValue: string | null;
  boxPhotoUrl: string | null;
  restricted: boolean;
  published: boolean;
}

export interface CreateSetInput {
  themeId: string;
  name: string;
  pieceCount: number;
  setNum?: string | null;
  year?: number | null;
  recommendedAge?: string | null;
  difficulty?: string | null;
  referenceValue?: string | null;
  boxPhotoUrl?: string | null;
  restricted?: boolean;
}

export type UpdateSetInput = Partial<Omit<CreateSetInput, "themeId">> & {
  themeId?: string;
};

/**
 * Fila de la lista de catálogo del back-office (`wireframes.md` §6.1).
 *
 * Trae el recuento de copias porque es lo que la lista tiene que responder de un
 * vistazo —"2/5 libres"— y sobre todo el caso que de verdad se cuela: un set
 * publicado con cero copias, que sale en el catálogo público y no se puede alquilar.
 */
export interface ManagedSetListItem {
  id: string;
  setNum: string | null;
  name: string;
  themeName: string;
  published: boolean;
  totalCopies: number;
  /** Copias en `DISPONIBLE`: las que alguien podría llevarse ahora mismo. */
  availableCopies: number;
}

export interface ListManagedSetsInput {
  /** Busca en el nombre y en la referencia. `null` o vacío = sin filtro. */
  search?: string | null;
  /** `null` = todos, incluidos los no publicados — que es el defecto de la pantalla. */
  published?: boolean | null;
  limit: number;
  offset: number;
}

export interface ManagedSetsPage {
  items: readonly ManagedSetListItem[];
  /** Sets que casan con el filtro; es lo que pagina. */
  totalSets: number;
  /** Copias de esos sets, para el recuento de la cabecera. */
  totalCopies: number;
}

/** El tema es un `uuid`, nunca texto libre: el alta lo elige de esta lista (§6.3). */
export interface ThemeOption {
  id: string;
  name: string;
}

export interface SetRepository {
  findById(setId: string): Promise<ManagedSet | null>;

  /** Catálogo completo para el back-office: **incluye los no publicados** (§2.1). */
  listManaged(input: ListManagedSetsInput): Promise<ManagedSetsPage>;

  /** Temas para el desplegable del alta y para nombrar el tema en la ficha. */
  listThemes(): Promise<readonly ThemeOption[]>;
  create(input: CreateSetInput): Promise<ManagedSet>;
  update(setId: string, input: UpdateSetInput): Promise<ManagedSet | null>;
  /** Cambia solo la publicación; devuelve `null` si el Set no existe. */
  setPublished(setId: string, published: boolean): Promise<ManagedSet | null>;
  themeExists(themeId: string): Promise<boolean>;
}
