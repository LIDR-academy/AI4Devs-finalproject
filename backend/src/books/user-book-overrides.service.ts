import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatchBookDto } from './dto/patch-book.dto';
import { CatalogEdition } from './entities/catalog-edition.entity';
import {
  OverridableBookField,
  UserBookOverride,
} from './entities/user-book-override.entity';

const PATCH_FIELD_MAP: Partial<
  Record<keyof PatchBookDto, OverridableBookField>
> = {
  title: 'title',
  authors: 'authors',
  cover_image_url: 'cover_image_url',
  page_count: 'page_count',
  series_name: 'series_name',
  publication_year: 'publication_year',
};

@Injectable()
export class UserBookOverridesService {
  constructor(
    @InjectRepository(UserBookOverride)
    private readonly overridesRepo: Repository<UserBookOverride>,
  ) {}

  async applyBibliographicPatch(
    bookId: string,
    catalog: CatalogEdition,
    dto: PatchBookDto,
  ): Promise<UserBookOverride | null> {
    let override = await this.overridesRepo.findOne({
      where: { userBookId: bookId },
    });

    const overriddenFields = new Set<OverridableBookField>(
      override?.overriddenFields ?? [],
    );

    for (const [dtoKey, field] of Object.entries(PATCH_FIELD_MAP) as Array<
      [keyof PatchBookDto, OverridableBookField]
    >) {
      if (dto[dtoKey] === undefined) {
        continue;
      }

      const patchValue = dto[dtoKey];
      const catalogValue = this.catalogValue(catalog, field);

      if (this.valuesEqual(patchValue, catalogValue, field)) {
        overriddenFields.delete(field);
        if (override) {
          this.setOverrideColumn(override, field, null);
        }
        continue;
      }

      overriddenFields.add(field);
      if (!override) {
        override = this.overridesRepo.create({
          userBookId: bookId,
          overriddenFields: [],
        });
      }
      this.setOverrideColumn(override, field, patchValue as string | number | null);
    }

    if (!override) {
      return null;
    }

    override.userBookId = bookId;
    override.overriddenFields = Array.from(overriddenFields);
    if (override.overriddenFields.length === 0) {
      await this.overridesRepo.delete({ userBookId: bookId });
      return null;
    }

    return this.overridesRepo.save({
      userBookId: bookId,
      overriddenFields: override.overriddenFields,
      title: override.title ?? null,
      authors: override.authors ?? null,
      coverImageUrl: override.coverImageUrl ?? null,
      pageCount: override.pageCount ?? null,
      seriesName: override.seriesName ?? null,
      publicationYear: override.publicationYear ?? null,
    });
  }

  private catalogValue(
    catalog: CatalogEdition,
    field: OverridableBookField,
  ): string | number | null {
    switch (field) {
      case 'title':
        return catalog.title;
      case 'authors':
        return catalog.authors;
      case 'cover_image_url':
        return catalog.coverImageUrl;
      case 'page_count':
        return catalog.pageCount;
      case 'series_name':
        return catalog.seriesName;
      case 'publication_year':
        return catalog.publicationYear;
      default:
        return null;
    }
  }

  private setOverrideColumn(
    override: UserBookOverride,
    field: OverridableBookField,
    value: string | number | null,
  ): void {
    switch (field) {
      case 'title':
        override.title = value as string | null;
        break;
      case 'authors':
        override.authors = value as string | null;
        break;
      case 'cover_image_url':
        override.coverImageUrl = value as string | null;
        break;
      case 'page_count':
        override.pageCount = value as number | null;
        break;
      case 'series_name':
        override.seriesName = value as string | null;
        break;
      case 'publication_year':
        override.publicationYear = value as number | null;
        break;
      default:
        break;
    }
  }

  private valuesEqual(
    patchValue: unknown,
    catalogValue: string | number | null,
    field: OverridableBookField,
  ): boolean {
    if (patchValue === catalogValue) {
      return true;
    }
    if (patchValue == null && catalogValue == null) {
      return true;
    }
    if (field === 'page_count' || field === 'publication_year') {
      return Number(patchValue) === Number(catalogValue);
    }
    return String(patchValue ?? '') === String(catalogValue ?? '');
  }
}
