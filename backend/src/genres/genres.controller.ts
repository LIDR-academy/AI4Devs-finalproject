import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenresService } from './genres.service';

@Controller('genres')
@UseGuards(JwtAuthGuard)
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Get()
  list(@Req() req: RequestWithUser) {
    return this.genresService.listForUser(req.user.userId);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() body: CreateGenreDto) {
    return this.genresService.createForUser(req.user.userId, body.name);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.genresService.deleteForUser(req.user.userId, id);
  }
}
