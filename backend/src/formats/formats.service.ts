import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReadingRecord } from '../books/entities/reading-record.entity';
import {
  DEFAULT_FORMAT_NAMES,
  LEGACY_NAME_BY_READ_FORMAT,
} from './formats.constants';
import { AffectedReadingsResponseDto } from './dto/affected-readings-response.dto';
import { FormatResponseDto, toFormatResponse } from './dto/format-response.dto';
import { Format } from './entities/format.entity';

@Injectable()
export class FormatsService {
  constructor(
    @InjectRepository(Format)
    private readonly formatsRepo: Repository<Format>,
    @InjectRepository(ReadingRecord)
    private readonly readingRepo: Repository<ReadingRecord>,
  ) {}

  async hasFormats(userId: string): Promise<boolean> {
    const count = await this.formatsRepo.count({ where: { userId } });
    return count > 0;
  }

  async listForUser(userId: string): Promise<FormatResponseDto[]> {
    const rows = await this.formatsRepo.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    return rows.map(toFormatResponse);
  }

  async createForUser(userId: string, name: string): Promise<FormatResponseDto> {
    const duplicate = await this.formatsRepo
      .createQueryBuilder('format')
      .where('format.user_id = :userId', { userId })
      .andWhere('LOWER(format.name) = LOWER(:name)', { name })
      .getOne();

    if (duplicate) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Ya existe un formato con este nombre',
        code: 'FORMAT_DUPLICATE',
      });
    }

    const format = await this.formatsRepo.save(
      this.formatsRepo.create({
        userId,
        name,
        isDefault: false,
      }),
    );

    return toFormatResponse(format);
  }

  async findOwnedById(userId: string, formatId: string): Promise<Format | null> {
    return this.formatsRepo.findOne({
      where: { id: formatId, userId },
    });
  }

  async countAffectedReadings(
    userId: string,
    formatId: string,
  ): Promise<AffectedReadingsResponseDto> {
    const format = await this.formatsRepo.findOne({
      where: { id: formatId, userId },
    });

    if (!format) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Formato no encontrado',
        code: 'FORMAT_NOT_FOUND',
      });
    }

    const affected_reading_count = await this.readingRepo
      .createQueryBuilder('reading')
      .innerJoin('reading.book', 'book')
      .where('book.user_id = :userId', { userId })
      .andWhere('reading.format_id = :formatId', { formatId })
      .getCount();

    return { affected_reading_count };
  }

  async deleteForUser(userId: string, formatId: string): Promise<void> {
    const format = await this.formatsRepo.findOne({
      where: { id: formatId, userId },
    });

    if (!format) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Formato no encontrado',
        code: 'FORMAT_NOT_FOUND',
      });
    }

    await this.formatsRepo.remove(format);
  }

  async seedDefaultsForUser(userId: string): Promise<Format[]> {
    if (await this.hasFormats(userId)) {
      return this.formatsRepo.find({ where: { userId }, order: { name: 'ASC' } });
    }

    const rows = DEFAULT_FORMAT_NAMES.map((name) =>
      this.formatsRepo.create({
        userId,
        name,
        isDefault: true,
      }),
    );

    return this.formatsRepo.save(rows);
  }

  async resolveFormatIdByLegacySlug(
    userId: string,
    legacySlug: string | null | undefined,
  ): Promise<string | null> {
    if (legacySlug === undefined || legacySlug === null) {
      return null;
    }

    await this.seedDefaultsForUser(userId);

    const formatName = LEGACY_NAME_BY_READ_FORMAT[legacySlug];
    if (!formatName) {
      return null;
    }

    const format = await this.formatsRepo
      .createQueryBuilder('format')
      .where('format.user_id = :userId', { userId })
      .andWhere('LOWER(format.name) = LOWER(:name)', { name: formatName })
      .getOne();

    return format?.id ?? null;
  }
}
