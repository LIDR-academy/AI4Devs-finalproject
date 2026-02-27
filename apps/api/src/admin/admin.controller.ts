import { Controller, Get, Param, Query } from '@nestjs/common';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { AdminService } from './admin.service';

class PaginationQuery {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

class UsersQuery extends PaginationQuery {
  @IsOptional()
  @IsIn(['name', 'email', 'orders', 'addresses', 'lastInteraction'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  registered?: string;
}

class OrdersQuery extends PaginationQuery {
  @IsOptional()
  @IsIn(['ref', 'store', 'user', 'amount', 'date'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('orders')
  getOrders(@Query() query: OrdersQuery) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50', 10) || 50));
    return this.adminService.getOrders(page, limit, {
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      q: query.q,
      status: query.status,
      mode: query.mode,
      from: query.from,
      to: query.to,
    });
  }

  @Get('users')
  getUsers(@Query() query: UsersQuery) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50', 10) || 50));
    return this.adminService.getUsers(page, limit, {
      sortBy: query.sortBy,
      sortDir: query.sortDir,
      q: query.q,
      registered: query.registered,
    });
  }

  @Get('conversations/:conversationId/messages')
  getConversationMessages(@Param('conversationId') conversationId: string) {
    return this.adminService.getConversationMessages(conversationId);
  }
}
