import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';
import { StatsQueryDto } from './dto/stats-query.dto';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStatsByQuery(
    @Req() req: RequestWithUser,
    @Query() query: StatsQueryDto,
  ) {
    if (query.period === 'year') {
      StatsService.validateYear(query.year);
      return this.statsService.getYearlyStats(req.user.userId, query.year);
    }

    if (query.month === undefined) {
      throw new BadRequestException(
        'month is required when period is month',
      );
    }
    StatsService.validate(query.year, query.month);
    return this.statsService.getMonthlyStats(
      req.user.userId,
      query.year,
      query.month,
    );
  }

  @Get(':year/:month')
  getMonthlyStats(
    @Req() req: RequestWithUser,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    StatsService.validate(year, month);
    return this.statsService.getMonthlyStats(req.user.userId, year, month);
  }
}
