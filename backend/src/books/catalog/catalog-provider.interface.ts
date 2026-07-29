import { CatalogEditionDto } from '../dto/catalog-edition.dto';

export interface CatalogProvider {
  search(query: string, limit: number): Promise<CatalogEditionDto[]>;
}

export const OPEN_LIBRARY_PROVIDER = Symbol('OPEN_LIBRARY_PROVIDER');
export const GOOGLE_BOOKS_PROVIDER = Symbol('GOOGLE_BOOKS_PROVIDER');
