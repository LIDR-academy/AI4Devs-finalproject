import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthenticatedUser } from '../common/authenticated-request';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { SubmitDiscoveryDto } from './dto/submit-discovery.dto';
import { DiscoveryService } from './discovery.service';

@UseGuards(JwtAuthGuard)
@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Post('submit')
  submit(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubmitDiscoveryDto) {
    return this.discoveryService.submit(user.id, dto);
  }
}
