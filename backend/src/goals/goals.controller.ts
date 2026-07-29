import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';
import { UpsertGoalDto } from './dto/upsert-goal.dto';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get(':year')
  getGoal(
    @Req() req: RequestWithUser,
    @Param('year', ParseIntPipe) year: number,
  ) {
    GoalsService.validateYear(year);
    return this.goalsService.getGoalWithProgress(req.user.userId, year);
  }

  @Put(':year')
  upsertGoal(
    @Req() req: RequestWithUser,
    @Param('year', ParseIntPipe) year: number,
    @Body() body: UpsertGoalDto,
  ) {
    GoalsService.validateYear(year);
    return this.goalsService.upsertGoal(
      req.user.userId,
      year,
      body.target_book_count,
    );
  }
}
