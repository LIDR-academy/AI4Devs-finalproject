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
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ActiveWorkOrderResponseDto } from './dto/active-work-order-response.dto';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { MechanicSummaryDto } from './dto/mechanic-summary.dto';
import { WorkOrderDetailResponseDto } from './dto/work-order-detail-response.dto';
import { WorkOrdersService } from './work-orders.service';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MECHANIC)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get('mechanics')
  findMechanics(): Promise<MechanicSummaryDto[]> {
    return this.workOrdersService.findActiveMechanics();
  }

  @Get('active')
  findActive(
    @Query('vehicleId', ParseUUIDPipe) vehicleId: string,
  ): Promise<ActiveWorkOrderResponseDto> {
    return this.workOrdersService.findActiveByVehicle(vehicleId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateWorkOrderDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WorkOrderDetailResponseDto> {
    return this.workOrdersService.create(dto, user.userId);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WorkOrderDetailResponseDto> {
    return this.workOrdersService.findById(id);
  }
}
