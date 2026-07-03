import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateItemExpirationDto } from "./dto/update-item-expiration.dto";
import { ExpiryPreferencesResponseDto } from "./dto/expiry-preference.dto";
import { ExpirationPreferenceRepository } from "./expiration-preference.repository";
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

  @Get("estimate-by-name")
  estimateByName(@Query("name") name: string) {
    return this.expirationService.estimateByName(name ?? "");
  }

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

@Controller("expiration")
@UseGuards(JwtAuthGuard)
export class ExpirationPreferencesController {
  constructor(
    private readonly expirationPreferenceRepository: ExpirationPreferenceRepository,
  ) {}

  @Get("preferences")
  async getPreferences(@Request() req: RequestWithUser): Promise<ExpiryPreferencesResponseDto> {
    const records = await this.expirationPreferenceRepository.findAllForUser(req.user.id);
    return {
      preferences: records.map((r) => ({
        category: r.category,
        averageDelta: r.averageDelta,
        sampleCount: r.sampleCount,
        lastUpdatedAt: r.updatedAt.toISOString(),
      })),
    };
  }

  @Delete("preferences/:category")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @Request() req: RequestWithUser,
    @Param("category") category: string,
  ): Promise<void> {
    await this.expirationPreferenceRepository.deleteCategory(req.user.id, category);
  }

  @Delete("preferences")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll(@Request() req: RequestWithUser): Promise<void> {
    await this.expirationPreferenceRepository.deleteAll(req.user.id);
  }
}
