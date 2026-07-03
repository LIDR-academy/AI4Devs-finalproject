import { ForbiddenException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { UsersService } from "../users/users.service";

export interface NotificationPreferenceResponse {
  expirationEnabled: boolean;
  priceDropEnabled: boolean;
  foodConsumedByOthersEnabled: boolean;
}

export interface AutoExpirySettingsResponse {
  enabled: boolean;
  thresholdDays: number;
}

export interface AutoExpirySettingsUpdate {
  enabled: boolean;
  thresholdDays?: number;
}

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getPreferences(userId: string): Promise<NotificationPreferenceResponse> {
    await this.assertUserExists(userId);

    const preference = await this.upsertPreference(
      userId,
      {
        userId,
        expirationEnabled: true,
        priceDropEnabled: true,
        foodConsumedByOthersEnabled: true,
      },
      {},
    );

    return {
      expirationEnabled: preference.expirationEnabled,
      priceDropEnabled: preference.priceDropEnabled,
      foodConsumedByOthersEnabled: preference.foodConsumedByOthersEnabled,
    };
  }

  async updatePreferences(
    userId: string,
    preferences: NotificationPreferenceResponse,
  ): Promise<NotificationPreferenceResponse> {
    await this.assertUserExists(userId);

    const preference = await this.upsertPreference(
      userId,
      { userId, ...preferences },
      { ...preferences },
    );

    return {
      expirationEnabled: preference.expirationEnabled,
      priceDropEnabled: preference.priceDropEnabled,
      foodConsumedByOthersEnabled: preference.foodConsumedByOthersEnabled,
    };
  }

  async getAutoExpiry(userId: string): Promise<AutoExpirySettingsResponse> {
    await this.assertUserExists(userId);

    const preference = await this.upsertPreference(userId, { userId }, {});

    return {
      enabled: preference.autoExpiryEnabled,
      thresholdDays: preference.autoExpiryThresholdDays,
    };
  }

  async updateAutoExpiry(
    userId: string,
    settings: AutoExpirySettingsUpdate,
  ): Promise<AutoExpirySettingsResponse> {
    await this.assertUserExists(userId);

    const data = {
      autoExpiryEnabled: settings.enabled,
      ...(settings.thresholdDays !== undefined && {
        autoExpiryThresholdDays: settings.thresholdDays,
      }),
    };

    const preference = await this.upsertPreference(userId, { userId, ...data }, { ...data });

    return {
      enabled: preference.autoExpiryEnabled,
      thresholdDays: preference.autoExpiryThresholdDays,
    };
  }

  async isExpirationEnabled(userId: string): Promise<boolean> {
    const preference = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preference) {
      return true;
    }

    return preference.expirationEnabled;
  }

  /**
   * Prisma's upsert is not atomic against a concurrent insert: two parallel requests for a
   * user's first-ever preference row (e.g. the settings page firing multiple GETs on mount)
   * can both miss the row and race to create it. On that race, the loser hits a unique
   * constraint violation (P2002) — fall back to a plain update since the row now exists.
   */
  private async upsertPreference(
    userId: string,
    create: Prisma.NotificationPreferenceUncheckedCreateInput,
    update: Prisma.NotificationPreferenceUncheckedUpdateInput,
  ) {
    try {
      return await this.prisma.notificationPreference.upsert({
        where: { userId },
        create,
        update,
      });
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        return this.prisma.notificationPreference.update({
          where: { userId },
          data: update,
        });
      }
      throw error;
    }
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to notification settings");
    }
  }
}
