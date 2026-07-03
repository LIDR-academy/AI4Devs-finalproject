export class ExpiryPreferenceDto {
  category!: string;
  averageDelta!: number;
  sampleCount!: number;
  lastUpdatedAt!: string;
}

export class ExpiryPreferencesResponseDto {
  preferences!: ExpiryPreferenceDto[];
}
