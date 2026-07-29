import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UserProfile, type UserPreferences } from './entities/user-profile.entity';
import {
  DEFAULT_THEME_PALETTE_ID,
  isThemePaletteId,
} from './theme-palette.constants';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
  ) {}

  async getForUser(userId: string): Promise<UserPreferences> {
    const profile = await this.ensureProfile(userId);
    return this.normalizePreferences(profile.preferences);
  }

  async updateForUser(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserPreferences> {
    if (
      dto.theme_palette_id !== undefined &&
      !isThemePaletteId(dto.theme_palette_id)
    ) {
      throw new BadRequestException('Invalid theme_palette_id');
    }

    const profile = await this.ensureProfile(userId);
    const next: UserPreferences = {
      ...this.normalizePreferences(profile.preferences),
      ...dto,
    };
    profile.preferences = next;
    await this.profileRepo.save(profile);
    return next;
  }

  private async ensureProfile(userId: string): Promise<UserProfile> {
    let profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepo.create({
        userId,
        preferences: { theme_palette_id: DEFAULT_THEME_PALETTE_ID },
      });
      profile = await this.profileRepo.save(profile);
    }
    return profile;
  }

  private normalizePreferences(preferences: UserPreferences): UserPreferences {
    const themePaletteId = preferences.theme_palette_id ?? DEFAULT_THEME_PALETTE_ID;
    if (!isThemePaletteId(themePaletteId)) {
      return { theme_palette_id: DEFAULT_THEME_PALETTE_ID };
    }
    return { theme_palette_id: themePaletteId };
  }
}
