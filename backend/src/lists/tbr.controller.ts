import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';
import { AddTbrEntryBodyDto } from './dto/add-tbr-entry.dto';
import { TbrService } from './tbr.service';

@Controller('tbr')
@UseGuards(JwtAuthGuard)
export class TbrController {
  constructor(private readonly tbrService: TbrService) {}

  @Get(':year/:month')
  getMonthlyTbr(
    @Req() req: RequestWithUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.tbrService.getOrCreateMonthlyTbr(req.user.userId, year, month);
  }

  @Post(':year/:month/entries')
  addEntry(
    @Req() req: RequestWithUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Body() body: AddTbrEntryBodyDto,
  ) {
    return this.tbrService.addEntry(
      req.user.userId,
      year,
      month,
      body.book_id,
    );
  }

  @Delete(':year/:month/entries/:entryId')
  @HttpCode(204)
  removeEntry(
    @Req() req: RequestWithUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Param('entryId') entryId: string,
  ) {
    return this.tbrService.removeEntry(
      req.user.userId,
      year,
      month,
      entryId,
    );
  }
}
