import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BulkDismissExpiredDto } from "./dto/bulk-dismiss-expired.dto";
import { BulkWasteDto } from "./dto/bulk-waste.dto";
import { CreatePantryItemDto } from "./dto/create-pantry-item.dto";
import { RegisterConsumptionEventDto } from "./dto/register-consumption-event.dto";
import { UpdatePantryItemDto } from "./dto/update-pantry-item.dto";
import { PantryService } from "./pantry.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("pantry/items")
@UseGuards(JwtAuthGuard)
export class PantryController {
  constructor(private readonly pantryService: PantryService) {}

  @Post()
  create(@Request() req: RequestWithUser, @Body() body: CreatePantryItemDto) {
    return this.pantryService.create(req.user.id, body);
  }

  @Get()
  list(@Request() req: RequestWithUser) {
    return this.pantryService.list(req.user.id);
  }

  @Get("events")
  listEvents(
    @Request() req: RequestWithUser,
    @Query("type") type?: "CONSUMED" | "WASTED",
  ) {
    return this.pantryService.listEvents(req.user.id, type);
  }

  @Get("expired-candidates")
  getExpiredCandidates(@Request() req: RequestWithUser) {
    return this.pantryService.getExpiredCandidatesForUser(req.user.id);
  }

  @Post("bulk-waste")
  bulkWaste(@Request() req: RequestWithUser, @Body() body: BulkWasteDto) {
    return this.pantryService.bulkWasteItems(req.user.id, body.itemIds);
  }

  @Post("bulk-dismiss-expired")
  bulkDismissExpired(@Request() req: RequestWithUser, @Body() body: BulkDismissExpiredDto) {
    return this.pantryService.bulkDismissExpired(req.user.id, body.itemIds);
  }

  @Patch(":id")
  update(
    @Request() req: RequestWithUser,
    @Param("id") itemId: string,
    @Body() body: UpdatePantryItemDto,
  ) {
    return this.pantryService.update(req.user.id, itemId, body);
  }

  @Post(":id/events")
  registerEvent(
    @Request() req: RequestWithUser,
    @Param("id") itemId: string,
    @Body() body: RegisterConsumptionEventDto,
  ) {
    return this.pantryService.registerEvent(req.user.id, itemId, body);
  }

  @Post("events/:eventId/re-add")
  reAddEvent(@Request() req: RequestWithUser, @Param("eventId") eventId: string) {
    return this.pantryService.reAddEvent(req.user.id, eventId);
  }
}
