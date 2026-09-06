import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { EligibleRemindersQueryDto } from './dto/eligible-reminders-query.dto';
import { EligibleRemindersResponseDto } from './dto/eligible-reminders-response.dto';
import {
  OptedOutRemindersResponseDto,
  ReminderOptResponseDto,
} from './dto/opted-out-reminders-response.dto';
import { SendRemindersDto } from './dto/send-reminders.dto';
import { SendRemindersResponseDto } from './dto/send-reminders-response.dto';
import { RemindersService } from './reminders.service';

@Controller('reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get('eligible')
  listEligible(
    @Query() query: EligibleRemindersQueryDto,
  ): Promise<EligibleRemindersResponseDto> {
    return this.remindersService.listEligible(query);
  }

  @Get('opted-out')
  listOptedOut(): Promise<OptedOutRemindersResponseDto> {
    return this.remindersService.listOptedOut();
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  send(
    @Body() dto: SendRemindersDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SendRemindersResponseDto> {
    return this.remindersService.sendReminders(dto, {
      userId: user.userId,
      email: user.email,
    });
  }

  @Post(':vehicleId/opt-out')
  @HttpCode(HttpStatus.OK)
  optOut(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReminderOptResponseDto> {
    return this.remindersService.optOut(vehicleId, user.userId);
  }

  @Post(':vehicleId/opt-in')
  @HttpCode(HttpStatus.OK)
  optIn(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ): Promise<ReminderOptResponseDto> {
    return this.remindersService.optIn(vehicleId);
  }
}
