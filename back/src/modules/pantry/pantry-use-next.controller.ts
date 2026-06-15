import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PantryService } from "./pantry.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("pantry")
@UseGuards(JwtAuthGuard)
export class PantryUseNextController {
  constructor(private readonly pantryService: PantryService) {}

  @Get("use-next")
  useNext(@Request() req: RequestWithUser) {
    return this.pantryService.getUseNext(req.user.id);
  }
}
