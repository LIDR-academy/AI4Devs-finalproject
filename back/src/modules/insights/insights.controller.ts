import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { InsightsService } from "./insights.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("insights")
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get("waste")
  getWasteMetrics(@Request() req: RequestWithUser) {
    return this.insightsService.getWasteMetrics(req.user.id);
  }
}
