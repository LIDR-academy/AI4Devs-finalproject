import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TrepEnum } from '../../infrastructure/enum/enum';
import { TrepService } from '../../infrastructure/service/service';
import { TrepEntity } from '../../domain/entity';
import { TrepDto } from '../../infrastructure/dto';

@Controller(TrepEnum.table)
export class TrepController {
  constructor(
    private readonly service: TrepService,
  ) { }

  @Get('/')
  public async findAll(@Body() params: ParamsDto): Promise<ApiResponses<TrepEntity>> {
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
  public async create(@Body() data: TrepDto): Promise<ApiResponse<TrepEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  public async update(@Param('id') id: number, @Body() data: TrepDto): Promise<ApiResponse<TrepEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  public async delete(@Param('id') id: number): Promise<ApiResponse<TrepEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

