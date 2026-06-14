import { Body, Controller, Get, HttpCode, Param, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateHouseholdDto } from "./dto/create-household.dto";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { TransferOwnershipDto } from "./dto/transfer-ownership.dto";
import { HouseholdsService } from "./households.service";

interface RequestWithUser {
  user: { id: string; email: string };
}

@Controller("households")
@UseGuards(JwtAuthGuard)
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Post()
  createHousehold(@Request() req: RequestWithUser, @Body() body: CreateHouseholdDto) {
    return this.householdsService.createHousehold(req.user.id, body.name);
  }

  @Get("mine")
  async getMyHousehold(@Request() req: RequestWithUser) {
    const household = await this.householdsService.getMyHousehold(req.user.id);
    return { household };
  }

  @Get(":id/members")
  listMembers(@Request() req: RequestWithUser, @Param("id") householdId: string) {
    return this.householdsService.listMembers(req.user.id, householdId);
  }

  @Post(":id/invitations")
  createInvitation(
    @Request() req: RequestWithUser,
    @Param("id") householdId: string,
    @Body() body: CreateInvitationDto,
  ) {
    return this.householdsService.createInvitation(req.user.id, householdId, body.inviteeEmail);
  }

  @Get(":id/invitations")
  listInvitations(@Request() req: RequestWithUser, @Param("id") householdId: string) {
    return this.householdsService.listHouseholdInvitations(req.user.id, householdId);
  }

  @Post(":id/transfer-ownership")
  @HttpCode(200)
  transferOwnership(
    @Request() req: RequestWithUser,
    @Param("id") householdId: string,
    @Body() body: TransferOwnershipDto,
  ) {
    return this.householdsService.transferOwnership(req.user.id, householdId, body.newOwnerUserId);
  }
}
