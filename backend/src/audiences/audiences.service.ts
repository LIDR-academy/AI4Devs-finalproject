import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { DEFAULT_AUDIENCE_NAMES } from './audiences.constants';
import { AudienceResponseDto, toAudienceResponse } from './dto/audience-response.dto';
import { AffectedBooksResponseDto } from './dto/affected-books-response.dto';
import { Audience } from './entities/audience.entity';

@Injectable()
export class AudiencesService {
  constructor(
    @InjectRepository(Audience)
    private readonly audiencesRepo: Repository<Audience>,
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
  ) {}

  async hasAudiences(userId: string): Promise<boolean> {
    const count = await this.audiencesRepo.count({ where: { userId } });
    return count > 0;
  }

  async listForUser(userId: string): Promise<AudienceResponseDto[]> {
    const rows = await this.audiencesRepo.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    return rows.map(toAudienceResponse);
  }

  async createForUser(userId: string, name: string): Promise<AudienceResponseDto> {
    const duplicate = await this.audiencesRepo
      .createQueryBuilder('audience')
      .where('audience.user_id = :userId', { userId })
      .andWhere('LOWER(audience.name) = LOWER(:name)', { name })
      .getOne();

    if (duplicate) {
      throw new ConflictException({
        statusCode: 409,
        message: 'Ya existe un elemento con este nombre',
        code: 'AUDIENCE_DUPLICATE',
      });
    }

    const audience = await this.audiencesRepo.save(
      this.audiencesRepo.create({
        userId,
        name,
        isDefault: false,
      }),
    );

    return toAudienceResponse(audience);
  }

  async findOwnedById(userId: string, audienceId: string): Promise<Audience | null> {
    return this.audiencesRepo.findOne({
      where: { id: audienceId, userId },
    });
  }

  async countAffectedBooks(
    userId: string,
    audienceId: string,
  ): Promise<AffectedBooksResponseDto> {
    const audience = await this.audiencesRepo.findOne({
      where: { id: audienceId, userId },
    });

    if (!audience) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Público objetivo no encontrado',
        code: 'AUDIENCE_NOT_FOUND',
      });
    }

    const affected_book_count = await this.booksRepo.count({
      where: { userId, audienceId },
    });

    return { affected_book_count };
  }

  async deleteForUser(userId: string, audienceId: string): Promise<void> {
    const audience = await this.audiencesRepo.findOne({
      where: { id: audienceId, userId },
    });

    if (!audience) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Público objetivo no encontrado',
        code: 'AUDIENCE_NOT_FOUND',
      });
    }

    await this.audiencesRepo.remove(audience);
  }

  async seedDefaultsForUser(userId: string): Promise<Audience[]> {
    if (await this.hasAudiences(userId)) {
      return this.audiencesRepo.find({ where: { userId }, order: { name: 'ASC' } });
    }

    const rows = DEFAULT_AUDIENCE_NAMES.map((name) =>
      this.audiencesRepo.create({
        userId,
        name,
        isDefault: true,
      }),
    );

    return this.audiencesRepo.save(rows);
  }
}
