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
import { CreateFormatDto } from './dto/create-format.dto';
import { FormatsService } from './formats.service';

@Controller('formats')
@UseGuards(JwtAuthGuard)
export class FormatsController {
  constructor(private readonly formatsService: FormatsService) {}

  @Get()
  list(@Req() req: RequestWithUser) {
    return this.formatsService.listForUser(req.user.userId);
  }

  @Post()
  create(@Req() req: RequestWithUser, @Body() body: CreateFormatDto) {
    return this.formatsService.createForUser(req.user.userId, body.name);
  }

  @Get(':id/affected-readings')
  affectedReadings(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.formatsService.countAffectedReadings(req.user.userId, id);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Req() req: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.formatsService.deleteForUser(req.user.userId, id);
  }
}
