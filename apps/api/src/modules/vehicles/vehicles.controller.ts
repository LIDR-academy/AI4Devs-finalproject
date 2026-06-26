import {
  BadRequestException,
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
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { SearchVehiclesQueryDto } from './dto/search-vehicles-query.dto';
import { VehicleHistoryResponseDto } from './dto/vehicle-history-response.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehicleSearchResponseDto } from './dto/vehicle-search-response.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MECHANIC)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get('search')
  search(
    @Query() query: SearchVehiclesQueryDto,
  ): Promise<VehicleSearchResponseDto> {
    if (!query.q && !query.licensePlate) {
      throw new BadRequestException(
        'At least one search parameter is required',
      );
    }

    return this.vehiclesService.search(query);
  }

  @Get(':id/history')
  getHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehicleHistoryResponseDto> {
    return this.vehiclesService.getHistory(id);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VehicleResponseDto> {
    return this.vehiclesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVehicleDto): Promise<VehicleResponseDto> {
    return this.vehiclesService.create(dto);
  }
}
