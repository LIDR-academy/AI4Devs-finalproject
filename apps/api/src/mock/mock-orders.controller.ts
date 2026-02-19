import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MockOrdersService } from './mock-orders.service';
import { CreateMockOrderDto } from './dto/create-mock-order.dto';

@Controller('mock/orders')
export class MockOrdersController {
  constructor(private readonly mockOrdersService: MockOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMockOrderDto) {
    return this.mockOrdersService.processMockOrder(dto);
  }
}
