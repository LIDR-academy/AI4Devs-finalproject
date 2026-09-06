import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { DeliveryService } from './delivery.service';
import { DeliverWorkOrderDto } from './dto/deliver-work-order.dto';
import { DeliverWorkOrderResponseDto } from './dto/deliver-work-order-response.dto';
import { DeliveryReadyDetailDto } from './dto/delivery-ready-detail.dto';
import { DeliveryReadyListResponseDto } from './dto/delivery-ready-list-response.dto';
import { DeliveryReadyQueryDto } from './dto/delivery-ready-query.dto';
import { MarkContactedResponseDto } from './dto/mark-contacted-response.dto';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('ready')
  listReady(
    @Query() query: DeliveryReadyQueryDto,
  ): Promise<DeliveryReadyListResponseDto> {
    return this.deliveryService.listReady(query);
  }

  @Get('ready/:workOrderId')
  getReadyDetail(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
  ): Promise<DeliveryReadyDetailDto> {
    return this.deliveryService.getReadyDetail(workOrderId);
  }

  @Patch('ready/:workOrderId/mark-contacted')
  markContacted(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MarkContactedResponseDto> {
    return this.deliveryService.markContacted(workOrderId, user.userId);
  }

  @Patch('ready/:workOrderId/deliver')
  markDelivered(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Body() dto: DeliverWorkOrderDto,
  ): Promise<DeliverWorkOrderResponseDto> {
    return this.deliveryService.markDelivered(workOrderId, dto);
  }
}
