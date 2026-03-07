import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ExpensesService } from '../services/expenses.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';
import { ExpenseListQueryDto } from '../dto/expense-list-query.dto';
import { ExpenseListResponseDto } from '../dto/expense-list-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';

/**
 * Controller for Expenses.
 *
 * This controller handles HTTP requests related to expense management.
 * Its main responsibility is to handle HTTP requests and input validations,
 * delegating all business logic to ExpensesService.
 */
@ApiTags('expenses')
@Controller('trips/:trip_id/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expenses_service: ExpensesService) {}

  /**
   * Retrieves all expenses for a trip with pagination and optional filters.
   * Only participants (CREATOR or MEMBER) can view expenses.
   * Expenses are ordered by expense_date DESC, then createdAt DESC.
   *
   * @method findAll
   * @param {string} trip_id - ID of the trip
   * @param {ExpenseListQueryDto} query_dto - DTO with pagination and filter parameters
   * @param {AuthenticatedRequest} req - Request with authenticated user
   * @returns {ExpenseListResponseDto} Paginated list of expenses with metadata
   * @throws {ForbiddenException} If user is not a participant
   * @throws {NotFoundException} If trip doesn't exist
   * @example
   * // GET /trips/123e4567-e89b-12d3-a456-426614174000/expenses
   * // Headers: Authorization: Bearer {token}
   * // Response: { expenses: [...], meta: { total: 45, page: 1, limit: 20, hasMore: true } }
   * @example
   * // GET /trips/123e4567-e89b-12d3-a456-426614174000/expenses?page=2&limit=10&category_id=1
   * // Headers: Authorization: Bearer {token}
   * // Response: { expenses: [...], meta: { total: 15, page: 2, limit: 10, hasMore: false } }
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List expenses for a trip',
    description:
      'Retrieves all expenses for a trip with pagination and optional filters. Only participants can view expenses. Expenses are ordered by expense_date DESC, then createdAt DESC.',
  })
  @ApiParam({
    name: 'trip_id',
    description: 'ID del viaje',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Límite de elementos por página (default: 20, máximo: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    type: Number,
    description: 'Filtrar por ID de categoría',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Lista de gastos obtenida exitosamente',
    type: ExpenseListResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parámetros de consulta inválidos',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Se requiere autenticación.',
  })
  @ApiForbiddenResponse({
    description: 'No eres participante de este viaje',
  })
  @ApiNotFoundResponse({
    description: 'El viaje no existe',
  })
  async findAll(
    @Param('trip_id', ParseUUIDPipe) trip_id: string,
    @Query() query_dto: ExpenseListQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ExpenseListResponseDto> {
    return this.expenses_service.findAllByTrip(
      trip_id,
      req.user!.id,
      query_dto,
    );
  }

  /**
   * Retrieves details of a specific expense for a trip.
   * Only participants (CREATOR or MEMBER) can view expenses.
   *
   * @method findOne
   * @param {string} trip_id - ID of the trip
   * @param {string} expense_id - ID of the expense
   * @param {AuthenticatedRequest} req - Request with authenticated user
   * @returns {ExpenseResponseDto} Expense details with beneficiaries
   * @throws {BadRequestException} If UUIDs are invalid
   * @throws {ForbiddenException} If user is not a participant
   * @throws {NotFoundException} If trip or expense doesn't exist
   * @example
   * // GET /trips/123e4567-e89b-12d3-a456-426614174000/expenses/223e4567-e89b-12d3-a456-426614174001
   * // Headers: Authorization: Bearer {token}
   * // Response: { id: "...", trip_id: "...", payer_id: "...", title: "...", amount: 150000, ... }
   */
  @Get(':expense_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get expense details',
    description:
      'Retrieves details of a specific expense. Only participants can view expenses.',
  })
  @ApiParam({
    name: 'trip_id',
    description: 'ID del viaje',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'expense_id',
    description: 'ID del gasto',
    type: String,
    example: '223e4567-e89b-12d3-a456-426614174001',
  })
  @ApiOkResponse({
    description: 'Detalles del gasto obtenidos exitosamente',
    type: ExpenseResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'ID de viaje o gasto inválido',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Se requiere autenticación.',
  })
  @ApiForbiddenResponse({
    description: 'No eres participante de este viaje',
  })
  @ApiNotFoundResponse({
    description: 'El viaje o el gasto no existe, o el gasto no pertenece a este viaje',
  })
  async findOne(
    @Param('trip_id', ParseUUIDPipe) trip_id: string,
    @Param('expense_id', ParseUUIDPipe) expense_id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ExpenseResponseDto> {
    return this.expenses_service.findOneById(
      trip_id,
      expense_id,
      req.user!.id,
    );
  }

  /**
   * Creates a new expense for a trip.
   * Only participants (CREATOR or MEMBER) can create expenses.
   * The trip must be active to allow expense creation.
   *
   * @method create
   * @param {string} trip_id - ID of the trip
   * @param {CreateExpenseDto} create_expense_dto - DTO with expense data
   * @param {AuthenticatedRequest} req - Request with authenticated user
   * @returns {ExpenseResponseDto} Created expense with beneficiaries
   * @throws {ForbiddenException} If user is not a participant
   * @throws {NotFoundException} If trip or category doesn't exist
   * @throws {BadRequestException} If beneficiaries are invalid
   * @example
   * // POST /trips/123e4567-e89b-12d3-a456-426614174000/expenses
   * // Headers: Authorization: Bearer {token}
   * // Body: {
   * //   "title": "Cena en restaurante",
   * //   "amount": 150000.0,
   * //   "category_id": 1,
   * //   "expense_date": "2024-01-15",
   * //   "receipt_url": "https://example.com/receipt.jpg",
   * //   "beneficiaries": [
   * //     { "user_id": "223e4567-e89b-12d3-a456-426614174001" },
   * //     { "user_id": "323e4567-e89b-12d3-a456-426614174002", "amount_owed": 75000.0 }
   * //   ]
   * // }
   * // Response: { id: "...", trip_id: "...", payer_id: "...", ... }
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new expense',
    description:
      'Creates a new expense for a trip. Only participants (CREATOR or MEMBER) can create expenses. The trip must be active.',
  })
  @ApiParam({
    name: 'trip_id',
    description: 'ID del viaje',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiCreatedResponse({
    description: 'Gasto creado exitosamente',
    type: ExpenseResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o beneficiarios no válidos',
  })
  @ApiUnauthorizedResponse({
    description: 'No autorizado. Se requiere autenticación.',
  })
  @ApiForbiddenResponse({
    description: 'No eres participante de este viaje',
  })
  @ApiNotFoundResponse({
    description: 'El viaje no existe o está cerrado, o la categoría no existe',
  })
  async create(
    @Param('trip_id', ParseUUIDPipe) trip_id: string,
    @Body() create_expense_dto: CreateExpenseDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ExpenseResponseDto> {
    return this.expenses_service.create(
      trip_id,
      req.user!.id,
      create_expense_dto,
    );
  }
}
