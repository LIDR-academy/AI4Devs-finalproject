import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { BookCoverSearchService } from './catalog/book-cover-search.service';
import { CatalogService } from './catalog/catalog.service';
import { EditionCoversService } from './catalog/edition-covers.service';
import { BookCoverSearchQueryDto } from './dto/book-cover-search.dto';
import { CatalogSearchQueryDto } from './dto/catalog-search-query.dto';
import { EditionCoversQueryDto } from './dto/edition-covers.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { PatchBookDto } from './dto/patch-book.dto';
import { PatchReadingRecordDto } from './dto/patch-reading-record.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly catalogService: CatalogService,
    private readonly editionCoversService: EditionCoversService,
    private readonly bookCoverSearchService: BookCoverSearchService,
  ) {}

  @Get()
  list(@Req() req: RequestWithUser) {
    return this.booksService.listForUser(req.user.userId);
  }

  @Get('catalog/covers')
  getEditionCovers(@Query() query: EditionCoversQueryDto) {
    return this.editionCoversService.getCovers(
      query.data_source,
      query.external_provider_id,
      query.hint_cover_url,
    );
  }

  @Get('catalog/search')
  searchCatalog(@Query() query: CatalogSearchQueryDto) {
    const limit = query.limit ?? 20;
    return this.catalogService.search(query.q, limit);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateBookDto) {
    return this.booksService.create(req.user.userId, dto);
  }

  @Get(':bookId/cover-search')
  searchBookCovers(
    @Req() req: RequestWithUser,
    @Param('bookId') bookId: string,
    @Query() query: BookCoverSearchQueryDto,
  ) {
    return this.bookCoverSearchService.searchForBook(
      req.user.userId,
      bookId,
      query.q,
    );
  }

  @Patch(':bookId')
  patchBook(
    @Req() req: RequestWithUser,
    @Param('bookId') bookId: string,
    @Body() dto: PatchBookDto,
  ) {
    return this.booksService.update(req.user.userId, bookId, dto);
  }

  @Patch(':bookId/reading-record')
  patchReadingRecord(
    @Req() req: RequestWithUser,
    @Param('bookId') bookId: string,
    @Body() dto: PatchReadingRecordDto,
  ) {
    return this.booksService.patchReadingRecord(
      req.user.userId,
      bookId,
      dto,
    );
  }
}
