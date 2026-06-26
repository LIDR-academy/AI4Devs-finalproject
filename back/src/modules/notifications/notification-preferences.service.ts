import { ForbiddenException, Injectable } from "@nestjs/common";
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

    const preference = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        expirationEnabled: true,
        priceDropEnabled: true,
        foodConsumedByOthersEnabled: true,
      },
      update: {},
    });

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

    const preference = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...preferences,
      },
      update: {
        ...preferences,
      },
    });

    return {
      expirationEnabled: preference.expirationEnabled,
      priceDropEnabled: preference.priceDropEnabled,
      foodConsumedByOthersEnabled: preference.foodConsumedByOthersEnabled,
    };
  }

  async getAutoExpiry(userId: string): Promise<AutoExpirySettingsResponse> {
    await this.assertUserExists(userId);

    const preference = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

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

    const preference = await this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
    });

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

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to notification settings");
    }
  }
}
