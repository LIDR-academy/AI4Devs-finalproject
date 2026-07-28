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
import {
  MatchGenreDto,
  MatchGenresBatchDto,
  toGenreMatchResponse,
} from './dto/match-genre.dto';
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

  @Post('match')
  async match(@Req() req: RequestWithUser, @Body() body: MatchGenreDto) {
    const result = await this.genresService.matchRawGenre(
      req.user.userId,
      body.raw_genre,
    );
    return toGenreMatchResponse(result);
  }

  @Post('match-batch')
  async matchBatch(
    @Req() req: RequestWithUser,
    @Body() body: MatchGenresBatchDto,
  ) {
    const results = await this.genresService.matchRawGenres(
      req.user.userId,
      body.raw_genres,
    );
    return { results: results.map(toGenreMatchResponse) };
  }

  @Get(':id/affected-books')
  affectedBooks(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.genresService.countAffectedBooks(req.user.userId, id);
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
