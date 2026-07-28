import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/request-with-user';
import {
  PreferencesResponseDto,
  UpdatePreferencesDto,
} from './dto/update-preferences.dto';
import { PreferencesService } from './preferences.service';

@Controller('me/preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  async get(@Req() req: RequestWithUser): Promise<PreferencesResponseDto> {
    const preferences = await this.preferencesService.getForUser(req.user.userId);
    return PreferencesResponseDto.fromPreferences(preferences);
  }

  @Patch()
  async patch(
    @Req() req: RequestWithUser,
    @Body() body: UpdatePreferencesDto,
  ): Promise<PreferencesResponseDto> {
    const preferences = await this.preferencesService.updateForUser(
      req.user.userId,
      body,
    );
    return PreferencesResponseDto.fromPreferences(preferences);
  }
}
