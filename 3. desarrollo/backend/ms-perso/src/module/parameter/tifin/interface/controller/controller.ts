import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TifinEnum } from '../../infrastructure/enum/enum';
import { TifinService } from '../../infrastructure/service/service';
import { TifinEntity } from '../../domain/entity';
import { TifinDto } from '../../infrastructure/dto';

@Controller(TifinEnum.table)
export class TifinController {
  constructor(
    private readonly service: TifinService,
  ) { }

  @Get('/')
  public async findAll(@Body() params: ParamsDto): Promise<ApiResponses<TifinEntity>> {
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
  public async create(@Body() data: TifinDto): Promise<ApiResponse<TifinEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  public async update(@Param('id') id: number, @Body() data: TifinDto): Promise<ApiResponse<TifinEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  public async delete(@Param('id') id: number): Promise<ApiResponse<TifinEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

