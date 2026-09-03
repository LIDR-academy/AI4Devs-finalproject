import { BadRequestException, Body, Controller, Get, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthenticatedUser } from '../common/authenticated-request';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { BusinessProfileService } from './business-profile.service';
import { ReviewBusinessProfileDto } from './dto/review-business-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('business-profile')
export class BusinessProfileController {
  constructor(private readonly profileService: BusinessProfileService) {}

  @Get()
  get(@CurrentUser() user: AuthenticatedUser, @Query('businessId', new ParseUUIDPipe({ version: '4', optional: true })) businessId?: string) {
    if (!businessId) {
      throw new BadRequestException('businessId query parameter is required');
    }
    return this.profileService.getOwned(user.id, businessId);
  }

  @Post('review')
  approve(@CurrentUser() user: AuthenticatedUser, @Body() dto: ReviewBusinessProfileDto) {
    return this.profileService.approve(user.id, dto.businessId);
  }
}
