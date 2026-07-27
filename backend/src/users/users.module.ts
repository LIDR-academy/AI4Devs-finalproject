import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudiencesModule } from '../audiences/audiences.module';
import { FormatsModule } from '../formats/formats.module';
import { GenresModule } from '../genres/genres.module';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AudiencesModule, FormatsModule, GenresModule],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
