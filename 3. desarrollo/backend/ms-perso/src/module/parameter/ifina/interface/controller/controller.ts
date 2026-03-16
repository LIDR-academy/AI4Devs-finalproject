import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiResponse, ApiResponses, ParamsDto } from 'src/shared/util';
import { IfinaEnum } from '../../infrastructure/enum/enum';
import { IfinaService } from '../../infrastructure/service/service';
import { IfinaEntity } from '../../domain/entity';
import { IfinaDto } from '../../infrastructure/dto';

@Controller(IfinaEnum.table)
export class IfinaController {
  constructor(
    private readonly service: IfinaService,
  ) { }

  @Get('/')
  public async findAll(@Body() params: ParamsDto): Promise<ApiResponses<IfinaEntity>> {
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
  public async create(@Body() data: IfinaDto): Promise<ApiResponse<IfinaEntity>> {
    try {
      const result = await this.service.create(data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  public async update(@Param('id') id: number, @Body() data: IfinaDto): Promise<ApiResponse<IfinaEntity>> {
    try {
      const result = await this.service.update(+id, data);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  public async delete(@Param('id') id: number): Promise<ApiResponse<IfinaEntity>> {
    try {
      const result = await this.service.delete(+id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

