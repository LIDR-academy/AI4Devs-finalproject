import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateItemExpirationDto } from "./dto/update-item-expiration.dto";
import { ExpirationService } from "./expiration.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller("pantry/items")
@UseGuards(JwtAuthGuard)
export class ExpirationController {
  constructor(private readonly expirationService: ExpirationService) {}

  @Post(":id/estimate-expiration")
  estimate(@Request() req: RequestWithUser, @Param("id") itemId: string) {
    return this.expirationService.estimateForItem(req.user.id, itemId);
  }

  @Patch(":id/expiration")
  overrideExpiration(
    @Request() req: RequestWithUser,
    @Param("id") itemId: string,
    @Body() body: UpdateItemExpirationDto,
  ) {
    return this.expirationService.overrideItemExpiration(req.user.id, itemId, body);
  }
}
