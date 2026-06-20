import { Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseholdsService } from "./households.service";

interface RequestWithUser {
  user: { id: string; email: string };
}

@Controller("invitations")
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Get("pending")
  listPending(@Request() req: RequestWithUser) {
    return this.householdsService.listPendingInvitationsForUser(req.user.id);
  }

  @Post(":id/accept")
  accept(@Request() req: RequestWithUser, @Param("id") invitationId: string) {
    return this.householdsService.acceptInvitation(req.user.id, invitationId);
  }
}
