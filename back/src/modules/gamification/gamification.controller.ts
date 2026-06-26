import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GetHistoryQueryDto } from "./dto/get-history-query.dto";
import { GamificationService } from "./gamification.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("gamification")
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get("summary")
  getSummary(@Request() req: RequestWithUser) {
    return this.gamificationService.getSummary(req.user.id);
  }

  @Get("history")
  getHistory(@Request() req: RequestWithUser, @Query() query: GetHistoryQueryDto) {
    return this.gamificationService.getHistory(req.user.id, query.limit ?? 20, query.offset ?? 0);
  }
}
