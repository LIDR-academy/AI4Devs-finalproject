import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { TirefEnum } from '../../infrastructure/enum/enum';
import { TirefService } from '../../infrastructure/service/service';
import { TirefEntity } from '../../domain/entity';
import { TirefDto } from '../../infrastructure/dto';

@Controller(TirefEnum.table)
export class TirefController {
  constructor(
    private readonly service: TirefService,
  ) { }

  @Get('/')
  public async findAll(@Body() params: ParamsDto): Promise<ApiResponses<TirefEntity>> {
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
  public async create(@Body() data: TirefDto): Promise<ApiResponse<TirefEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  public async update(@Param('id') id: number, @Body() data: TirefDto): Promise<ApiResponse<TirefEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  public async delete(@Param('id') id: number): Promise<ApiResponse<TirefEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

