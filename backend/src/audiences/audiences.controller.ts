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
import { AudiencesService } from './audiences.service';
import { CreateAudienceDto } from './dto/create-audience.dto';

@Controller('audiences')
@UseGuards(JwtAuthGuard)
export class AudiencesController {
  constructor(private readonly audiencesService: AudiencesService) {}

  @Get()
  list(@Req() req: RequestWithUser) {
    return this.audiencesService.listForUser(req.user.userId);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() body: CreateAudienceDto) {
    return this.audiencesService.createForUser(req.user.userId, body.name);
  }

  @Get(':id/affected-books')
  affectedBooks(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.audiencesService.countAffectedBooks(req.user.userId, id);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.audiencesService.deleteForUser(req.user.userId, id);
  }
}
