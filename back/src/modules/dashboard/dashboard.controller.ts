import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  summary(@Request() req: RequestWithUser) {
    return this.dashboardService.getSummary(req.user.id);
  }

  @Get("use-next")
  useNext(@Request() req: RequestWithUser) {
    return this.dashboardService.getUseNext(req.user.id);
  }
}
