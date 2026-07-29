import { IsIn, IsOptional } from 'class-validator';
import {
  DEFAULT_THEME_PALETTE_ID,
  THEME_PALETTE_IDS,
} from '../theme-palette.constants';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsIn([...THEME_PALETTE_IDS])
  theme_palette_id?: string;
}

export class PreferencesResponseDto {
  theme_palette_id: string;

  static fromPreferences(preferences: { theme_palette_id?: string }): PreferencesResponseDto {
    return {
      theme_palette_id: preferences.theme_palette_id ?? DEFAULT_THEME_PALETTE_ID,
    };
  }
}
