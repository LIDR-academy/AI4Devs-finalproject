import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreatePantryItemDto } from "./dto/create-pantry-item.dto";
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
}
