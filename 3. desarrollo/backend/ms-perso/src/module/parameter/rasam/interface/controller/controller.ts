import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { RasamEnum } from '../../infrastructure/enum/enum';
import { RasamService } from '../../infrastructure/service/service';
import { RasamEntity } from '../../domain/entity';
import { RasamDto } from '../../infrastructure/dto';

@Controller(RasamEnum.table)
export class RasamController {
  constructor(
    private readonly service: RasamService,
  ) { }

  @Get('/')
  public async findAll(@Body() params: ParamsDto): Promise<ApiResponses<RasamEntity>> {
    try {
      const result = await this.service.findAll(params);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  public async findById(@Param('id') id: number) {
    try {
      const result = await this.service.findById(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  public async create(@Body() data: RasamDto): Promise<ApiResponse<RasamEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  public async update(@Param('id') id: number, @Body() data: RasamDto): Promise<ApiResponse<RasamEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  public async delete(@Param('id') id: number): Promise<ApiResponse<RasamEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

