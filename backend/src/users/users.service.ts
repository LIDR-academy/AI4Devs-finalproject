import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudiencesService } from '../audiences/audiences.service';
import { FormatsService } from '../formats/formats.service';
import { GenresService } from '../genres/genres.service';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly audiencesService: AudiencesService,
    private readonly formatsService: FormatsService,
    private readonly genresService: GenresService,
  ) {}

  async findOrCreateByEmail(email: string): Promise<User> {
    const normalized = email.trim().toLowerCase();
    let user = await this.usersRepo.findOne({ where: { email: normalized } });
    if (!user) {
      user = this.usersRepo.create({ email: normalized, passwordHash: null });
      user = await this.usersRepo.save(user);
      await this.audiencesService.seedDefaultsForUser(user.id);
      await this.formatsService.seedDefaultsForUser(user.id);
      await this.genresService.seedDefaultsForUser(user.id);
    }
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }
}
