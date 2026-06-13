import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
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
}
