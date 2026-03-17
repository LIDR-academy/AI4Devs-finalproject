import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ExpensesService } from '../services/expenses.service';
import { ExpenseCategoryResponseDto } from '../dto/expense-category-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

/**
 * Controller for listing expense categories.
 * Used by the frontend to populate category selectors when creating/editing expenses.
 */
@ApiTags('expense-categories')
@Controller('expense-categories')
@UseGuards(JwtAuthGuard)
export class ExpenseCategoriesController {
  constructor(private readonly expenses_service: ExpensesService) {}

  /**
   * Returns all active expense categories.
   *
   * @returns List of categories (id, name, icon, is_active)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List expense categories',
    description:
      'Returns all active expense categories for use in expense forms.',
  })
  @ApiOkResponse({
    description: 'List of categories',
    type: [ExpenseCategoryResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Se requiere autenticación.',
  })
  async findAll(): Promise<ExpenseCategoryResponseDto[]> {
    return this.expenses_service.findAllCategories();
  }
}
