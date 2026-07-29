import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CatalogEditionDto } from '../dto/catalog-edition.dto';
import { CatalogProvider } from './catalog-provider.interface';
import { OpenLibraryEnrichmentService } from './open-library-enrichment.service';
import type { OlSearchDocFields } from './open-library-enrichment';

@Injectable()
export class OpenLibraryClient implements CatalogProvider {
  constructor(
    private readonly http: HttpService,
    private readonly enrichment: OpenLibraryEnrichmentService,
  ) {}

  async search(query: string, limit: number): Promise<CatalogEditionDto[]> {
    const { data } = await firstValueFrom(
      this.http.get<{ docs?: OlSearchDocFields[] }>(
        'https://openlibrary.org/search.json',
        {
          params: { q: query, limit },
        },
      ),
    );

    const docs = (data.docs ?? []).filter((doc) => doc.title && doc.key);
    const mapped = docs.map((doc) => this.mapDoc(doc));

    const enriched = await Promise.all(
      docs.map((doc, i) => this.enrichment.enrichSearchDoc(doc, mapped[i])),
    );

    return enriched;
  }

  private mapDoc(doc: OlSearchDocFields): CatalogEditionDto {
    const isbns = doc.isbn ?? [];
    const isbn13 = isbns.find((i) => i.replace(/-/g, '').length === 13) ?? null;
    const isbn10 =
      isbns.find((i) => {
        const n = i.replace(/-/g, '');
        return n.length === 10;
      }) ?? null;

    return {
      title: doc.title!,
      authors: (doc.author_name ?? ['Unknown']).join(', '),
      cover_image_url: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : null,
      page_count: doc.number_of_pages_median ?? null,
      genre: doc.subject?.[0] ?? null,
      isbn_13: isbn13 ? isbn13.replace(/-/g, '') : null,
      isbn_10: isbn10 ? isbn10.replace(/-/g, '') : null,
      data_source: 'open_library',
      external_provider_id: doc.key!,
    };
  }
}
