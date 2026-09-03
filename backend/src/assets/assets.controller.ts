import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthenticatedUser } from '../common/authenticated-request';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { AssetsService } from './assets.service';
import { EditAssetDto } from './dto/edit-asset.dto';
import { GenerateAssetsDto } from './dto/generate-assets.dto';
import { RegenerateAssetDto } from './dto/regenerate-asset.dto';

@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('generate-digital-presence')
  generate(@CurrentUser() user: AuthenticatedUser, @Body() dto: GenerateAssetsDto) {
    return this.assetsService.generate(user.id, dto);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query('businessId', new ParseUUIDPipe({ version: '4', optional: true })) businessId?: string) {
    if (!businessId) {
      throw new BadRequestException('businessId query parameter is required');
    }
    return this.assetsService.list(user.id, businessId);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id', new ParseUUIDPipe({ version: '4' })) assetId: string) {
    return this.assetsService.get(user.id, assetId);
  }

  @Patch(':id')
  edit(@CurrentUser() user: AuthenticatedUser, @Param('id', new ParseUUIDPipe({ version: '4' })) assetId: string, @Body() dto: EditAssetDto) {
    return this.assetsService.edit(user.id, assetId, dto);
  }

  @Post(':id/regenerate')
  regenerate(@CurrentUser() user: AuthenticatedUser, @Param('id', new ParseUUIDPipe({ version: '4' })) assetId: string, @Body() dto: RegenerateAssetDto) {
    return this.assetsService.regenerate(user.id, assetId, dto);
  }
}
