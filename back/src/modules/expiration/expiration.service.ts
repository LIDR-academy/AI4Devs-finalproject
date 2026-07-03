import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ExpirationMethod } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { UpdateItemExpirationDto } from "./dto/update-item-expiration.dto";
import { ExpirationPreferenceRepository } from "./expiration-preference.repository";
import { ExpirationRulesService } from "./expiration-rules.service";

const CLAMP_DAYS = 30;
const CONFIDENCE_MEDIUM_THRESHOLD = 0.6;
const LEARNING_MIN_SAMPLE_COUNT = 3;

@Injectable()
export class ExpirationService {
  private readonly logger = new Logger(ExpirationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly expirationRulesService: ExpirationRulesService,
    private readonly expirationPreferenceRepository: ExpirationPreferenceRepository,
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

    const preference = await this.expirationPreferenceRepository.findByUserAndCategory(
      userId,
      estimate.category,
    );

    const adjustedDate = this.applyLearning(estimate.suggestedExpirationDate, preference);
    const adjustedConfidence = this.applyConfidenceUpgrade(estimate.confidence, preference);

    const assessment = await this.prisma.expirationAssessment.upsert({
      where: {
        pantryItemId: pantryItem.id,
      },
      create: {
        pantryItemId: pantryItem.id,
        suggestedExpirationDate: adjustedDate,
        confidence: adjustedConfidence.toFixed(2),
        method: ExpirationMethod.RULE_BASED_SPAIN,
        userConfirmed: false,
      },
      update: {
        suggestedExpirationDate: adjustedDate,
        confidence: adjustedConfidence.toFixed(2),
        method: ExpirationMethod.RULE_BASED_SPAIN,
        userConfirmed: false,
        confirmedByUserId: null,
      },
    });

    this.logger.log(
      `Expiration estimate generated for pantryItem=${pantryItem.id} with confidence=${adjustedConfidence}`,
    );

    return {
      pantryItemId: pantryItem.id,
      itemName: pantryItem.name,
      suggestedExpirationDate: assessment.suggestedExpirationDate,
      confidence: Number(assessment.confidence),
      method: assessment.method,
      lowConfidence: Number(assessment.confidence) < CONFIDENCE_MEDIUM_THRESHOLD,
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

    const priorAssessment = await this.prisma.expirationAssessment.findUnique({
      where: { pantryItemId: pantryItem.id },
    });

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

    if (
      priorAssessment &&
      priorAssessment.method === ExpirationMethod.RULE_BASED_SPAIN &&
      priorAssessment.suggestedExpirationDate
    ) {
      const delta = this.daysBetween(priorAssessment.suggestedExpirationDate, expirationDate);
      const { category } = this.expirationRulesService.estimateFromName(pantryItem.name);
      try {
        await this.expirationPreferenceRepository.upsertDelta(userId, category, delta);
      } catch (error: unknown) {
        this.logger.warn(
          `Failed to record expiry preference delta for user=${userId} category=${category}: ${String(error)}`,
        );
      }
    }

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

  private applyLearning(
    baseDate: Date,
    preference: { averageDelta: number; sampleCount: number } | null,
  ): Date {
    if (!preference || preference.sampleCount < LEARNING_MIN_SAMPLE_COUNT) {
      return baseDate;
    }

    const clampedDelta = Math.max(-CLAMP_DAYS, Math.min(CLAMP_DAYS, preference.averageDelta));
    const adjusted = new Date(baseDate);
    adjusted.setDate(adjusted.getDate() + Math.round(clampedDelta));
    return adjusted;
  }

  private applyConfidenceUpgrade(
    baseConfidence: number,
    preference: { sampleCount: number } | null,
  ): number {
    if (preference && preference.sampleCount >= LEARNING_MIN_SAMPLE_COUNT) {
      return Math.max(baseConfidence, CONFIDENCE_MEDIUM_THRESHOLD);
    }
    return baseConfidence;
  }

  private daysBetween(from: Date, to: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((to.getTime() - from.getTime()) / msPerDay);
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
