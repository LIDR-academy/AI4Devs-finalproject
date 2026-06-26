import {
  BadRequestException,
  Body,
  Controller,
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
import { ClientsService } from './clients.service';
import { ClientResponseDto } from './dto/client-response.dto';
import { ClientSearchResponseDto } from './dto/client-search-response.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { SearchClientsQueryDto } from './dto/search-clients-query.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MECHANIC)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('search')
  search(
    @Query() query: SearchClientsQueryDto,
  ): Promise<ClientSearchResponseDto> {
    if (!query.q && !query.nationalId) {
      throw new BadRequestException(
        'At least one search parameter is required',
      );
    }

    return this.clientsService.search(query);
  }

  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ClientResponseDto> {
    return this.clientsService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateClientDto): Promise<ClientResponseDto> {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientsService.update(id, dto);
  }
}
