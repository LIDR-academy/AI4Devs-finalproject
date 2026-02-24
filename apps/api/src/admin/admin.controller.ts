import { Controller, Get, Param, Query } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { AdminService } from './admin.service';

class PaginationQuery {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  getOrders(@Query() query: PaginationQuery) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50', 10) || 50));
    return this.adminService.getOrders(page, limit);
  }

  @Get('users')
  getUsers(@Query() query: PaginationQuery) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50', 10) || 50));
    return this.adminService.getUsers(page, limit);
  }

  @Get('conversations/:conversationId/messages')
  getConversationMessages(@Param('conversationId') conversationId: string) {
    return this.adminService.getConversationMessages(conversationId);
  }
}
