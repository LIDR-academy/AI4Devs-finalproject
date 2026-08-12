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

export interface SetRepository {
  findById(setId: string): Promise<ManagedSet | null>;
  create(input: CreateSetInput): Promise<ManagedSet>;
  update(setId: string, input: UpdateSetInput): Promise<ManagedSet | null>;
  /** Cambia solo la publicación; devuelve `null` si el Set no existe. */
  setPublished(setId: string, published: boolean): Promise<ManagedSet | null>;
  themeExists(themeId: string): Promise<boolean>;
}
