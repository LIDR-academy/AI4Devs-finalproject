import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookCoverSearchEditionDto,
  BookCoverSearchResponseDto,
} from '../dto/book-cover-search.dto';
import { BookMetadataResolver } from '../book-metadata.resolver';
import { Book } from '../entities/book.entity';
import { CatalogService } from './catalog.service';
import { EditionCoversService } from './edition-covers.service';

const DEFAULT_SEARCH_LIMIT = 20;

@Injectable()
export class BookCoverSearchService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
    private readonly catalogService: CatalogService,
    private readonly editionCoversService: EditionCoversService,
    private readonly metadataResolver: BookMetadataResolver,
  ) {}

  async searchForBook(
    userId: string,
    bookId: string,
    queryOverride?: string,
  ): Promise<BookCoverSearchResponseDto> {
    const book = await this.booksRepo.findOne({
      where: { id: bookId, userId },
      relations: ['catalogEdition', 'override'],
    });
    if (!book?.catalogEdition) {
      throw new NotFoundException('Book not found');
    }

    const effective = this.metadataResolver.resolveEffective(
      book.catalogEdition,
      book.override,
    );

    const query = BookCoverSearchService.resolveQuery(
      effective.title,
      effective.authors,
      queryOverride,
    );

    const search = await this.catalogService.search(query, DEFAULT_SEARCH_LIMIT);
    const items: BookCoverSearchEditionDto[] = [];

    for (const edition of search.items) {
      const coverResult = await this.editionCoversService.getCovers(
        edition.data_source,
        edition.external_provider_id,
        edition.cover_image_url ?? undefined,
      );

      if (coverResult.covers.length === 0) {
        continue;
      }

      items.push({
        title: edition.title,
        authors: edition.authors,
        data_source: edition.data_source,
        external_provider_id: edition.external_provider_id,
        cover_image_url: edition.cover_image_url,
        covers: coverResult.covers,
        default_cover_id: coverResult.default_cover_id,
      });
    }

    return {
      query,
      source: search.source,
      items,
    };
  }

  static buildDefaultQuery(title: string, authors: string): string {
    return `${title} ${authors}`.trim().replace(/\s+/g, ' ');
  }

  static resolveQuery(
    title: string,
    authors: string,
    queryOverride?: string,
  ): string {
    const trimmedOverride = queryOverride?.trim();
    const query =
      trimmedOverride && trimmedOverride.length > 0
        ? trimmedOverride
        : BookCoverSearchService.buildDefaultQuery(title, authors);

    if (query.length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    return query;
  }
}
