import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehicleSearchResponseDto } from './dto/vehicle-search-response.dto';
import { HistoryService } from '../history/history.service';
import { VehicleHistoryResponseDto } from '../history/dto/vehicle-history-response.dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MECHANIC)
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly historyService: HistoryService,
  ) {}

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
    return this.historyService.getVehicleHistory(id);
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

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ): Promise<VehicleResponseDto> {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.vehiclesService.delete(id);
  }
}
