import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ExpirationMethod } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { UpdateItemExpirationDto } from "./dto/update-item-expiration.dto";
import { ExpirationRulesService } from "./expiration-rules.service";

@Injectable()
export class ExpirationService {
  private readonly logger = new Logger(ExpirationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly expirationRulesService: ExpirationRulesService,
  ) {}

  estimateByName(name: string) {
    const estimate = this.expirationRulesService.buildEstimate(name);
    return {
      suggestedExpirationDate: estimate.suggestedExpirationDate.toISOString(),
      confidence: estimate.confidence,
      method: "RULE_BASED_SPAIN" as const,
      lowConfidence: estimate.lowConfidence,
      category: estimate.category,
    };
  }

  async estimateForItem(userId: string, itemId: string) {
    const pantryItem = await this.getPantryItemOrThrow(userId, itemId);
    const estimate = this.expirationRulesService.buildEstimate(pantryItem.name);

    const assessment = await this.prisma.expirationAssessment.upsert({
      where: {
        pantryItemId: pantryItem.id,
      },
      create: {
        pantryItemId: pantryItem.id,
        suggestedExpirationDate: estimate.suggestedExpirationDate,
        confidence: estimate.confidence.toFixed(2),
        method: ExpirationMethod.RULE_BASED_SPAIN,
        userConfirmed: false,
      },
      update: {
        suggestedExpirationDate: estimate.suggestedExpirationDate,
        confidence: estimate.confidence.toFixed(2),
        method: ExpirationMethod.RULE_BASED_SPAIN,
        userConfirmed: false,
        confirmedByUserId: null,
      },
    });

    this.logger.log(
      `Expiration estimate generated for pantryItem=${pantryItem.id} with confidence=${estimate.confidence}`,
    );

    return {
      pantryItemId: pantryItem.id,
      itemName: pantryItem.name,
      suggestedExpirationDate: assessment.suggestedExpirationDate,
      confidence: Number(assessment.confidence),
      method: assessment.method,
      lowConfidence: estimate.lowConfidence,
      category: estimate.category,
    };
  }

  async overrideItemExpiration(
    userId: string,
    itemId: string,
    dto: UpdateItemExpirationDto,
  ) {
    const pantryItem = await this.getPantryItemOrThrow(userId, itemId);
    const expirationDate = new Date(dto.expirationDate);

    const updatedItem = await this.prisma.pantryItem.update({
      where: { id: pantryItem.id },
      data: {
        expirationDate,
      },
    });

    const assessment = await this.prisma.expirationAssessment.upsert({
      where: {
        pantryItemId: pantryItem.id,
      },
      create: {
        pantryItemId: pantryItem.id,
        suggestedExpirationDate: expirationDate,
        confidence: "1.00",
        method: ExpirationMethod.MANUAL_OVERRIDE,
        userConfirmed: true,
        confirmedByUserId: userId,
      },
      update: {
        suggestedExpirationDate: expirationDate,
        confidence: "1.00",
        method: ExpirationMethod.MANUAL_OVERRIDE,
        userConfirmed: true,
        confirmedByUserId: userId,
      },
    });

    this.logger.log(
      `Expiration overridden for pantryItem=${pantryItem.id} by user=${userId}`,
    );

    return {
      pantryItemId: updatedItem.id,
      expirationDate: updatedItem.expirationDate,
      assessment: {
        suggestedExpirationDate: assessment.suggestedExpirationDate,
        confidence: Number(assessment.confidence),
        method: assessment.method,
        userConfirmed: assessment.userConfirmed,
      },
    };
  }

  private async getPantryItemOrThrow(userId: string, itemId: string) {
    const pantryItem = await this.prisma.pantryItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!pantryItem) {
      const itemExists = await this.prisma.pantryItem.findUnique({
        where: { id: itemId },
      });

      if (itemExists) {
        throw new ForbiddenException("No access to this pantry item");
      }

      throw new NotFoundException("Pantry item not found");
    }

    return pantryItem;
  }
}
