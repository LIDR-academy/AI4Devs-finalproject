import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, DataSource } from 'typeorm';
import { isUUID } from 'class-validator';
import { Expense } from '../entities/expense.entity';
import { ExpenseSplit } from '../entities/expense-split.entity';
import { ExpenseCategory } from '../entities/expense-category.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { TripParticipant } from '../../trips/entities/trip-participant.entity';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { ExpenseResponseDto } from '../dto/expense-response.dto';
import { ExpenseListQueryDto } from '../dto/expense-list-query.dto';
import { ExpenseListResponseDto } from '../dto/expense-list-response.dto';
import { TripStatus } from '../../trips/enums/trip-status.enum';

/**
 * Service for Expenses.
 * Responsibility: Contains business logic and data access using TypeORM.
 */
@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseSplit)
    private readonly expenseSplitRepository: Repository<ExpenseSplit>,
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepository: Repository<ExpenseCategory>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(TripParticipant)
    private readonly tripParticipantRepository: Repository<TripParticipant>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Verifies if a user is a participant of a trip.
   *
   * @param trip_id - ID of the trip
   * @param user_id - ID of the user
   * @returns True if user is a participant, false otherwise
   */
  private async verifyUserIsParticipant(
    trip_id: string,
    user_id: string,
  ): Promise<boolean> {
    const participant = await this.tripParticipantRepository.findOne({
      where: {
        tripId: trip_id,
        userId: user_id,
        deletedAt: IsNull(),
      },
    });

    return participant !== null;
  }

  /**
   * Verifies if a trip exists (can be active or closed).
   *
   * @param trip_id - ID of the trip
   * @returns Trip entity if found
   * @throws NotFoundException if trip doesn't exist
   */
  private async verifyTripExists(trip_id: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: {
        id: trip_id,
        deletedAt: IsNull(),
      },
    });

    if (!trip) {
      this.logger.warn(`Trip not found: trip_id=${trip_id}`);
      throw new NotFoundException('El viaje no existe');
    }

    return trip;
  }

  /**
   * Verifies if a trip exists and is active.
   *
   * @param trip_id - ID of the trip
   * @returns Trip entity if found and active
   * @throws NotFoundException if trip doesn't exist or is not active
   */
  private async verifyTripExistsAndActive(trip_id: string): Promise<Trip> {
    const trip = await this.verifyTripExists(trip_id);

    if (trip.status !== TripStatus.ACTIVE) {
      this.logger.warn(`Trip is not active: trip_id=${trip_id}`);
      throw new NotFoundException(
        'El viaje está cerrado. No se pueden agregar gastos a viajes cerrados',
      );
    }

    return trip;
  }

  /**
   * Verifies if a category exists and is active.
   *
   * @param category_id - ID of the category
   * @returns ExpenseCategory entity if found and active
   * @throws NotFoundException if category doesn't exist or is not active
   */
  private async verifyCategoryExistsAndActive(
    category_id: number,
  ): Promise<ExpenseCategory> {
    const category = await this.expenseCategoryRepository.findOne({
      where: {
        id: category_id,
        isActive: true,
      },
    });

    if (!category) {
      this.logger.warn(`Category not found or not active: category_id=${category_id}`);
      throw new NotFoundException(
        'La categoría no existe o no está activa',
      );
    }

    return category;
  }

  /**
   * Verifies that all beneficiary user IDs are participants of the trip.
   *
   * @param trip_id - ID of the trip
   * @param user_ids - Array of user IDs to verify
   * @throws BadRequestException if any user is not a participant
   */
  private async verifyBeneficiariesAreParticipants(
    trip_id: string,
    user_ids: string[],
  ): Promise<void> {
    const participants = await this.tripParticipantRepository.find({
      where: {
        tripId: trip_id,
        userId: In(user_ids),
        deletedAt: IsNull(),
      },
      select: ['userId'],
    });

    const participant_user_ids = new Set(
      participants.map((p) => p.userId),
    );

    const invalid_user_ids = user_ids.filter(
      (id) => !participant_user_ids.has(id),
    );

    if (invalid_user_ids.length > 0) {
      this.logger.warn(
        `Beneficiaries are not participants: trip_id=${trip_id}, invalid_user_ids=${invalid_user_ids.join(', ')}`,
      );
      throw new BadRequestException(
        `Los siguientes usuarios no son participantes del viaje: ${invalid_user_ids.join(', ')}`,
      );
    }
  }

  /**
   * Calculates fair share amount for each beneficiary.
   * Divides the total amount equally among all beneficiaries.
   *
   * @param total_amount - Total expense amount
   * @param beneficiary_count - Number of beneficiaries
   * @returns Fair share amount per beneficiary
   */
  private calculateFairShare(
    total_amount: number,
    beneficiary_count: number,
  ): number {
    return Number((total_amount / beneficiary_count).toFixed(2));
  }

  /**
   * Creates a new expense for a trip.
   * Validates that the user is a participant, the trip is active,
   * the category exists, and all beneficiaries are participants.
   * Creates expense and expense splits in a transaction.
   *
   * @param trip_id - ID of the trip
   * @param user_id - ID of the user creating the expense (payer)
   * @param create_expense_dto - DTO with expense data
   * @returns Created expense with beneficiaries
   * @throws ForbiddenException if user is not a participant
   * @throws NotFoundException if trip or category doesn't exist
   * @throws BadRequestException if beneficiaries are invalid
   */
  async create(
    trip_id: string,
    user_id: string,
    create_expense_dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    // Verify user is participant
    const is_participant = await this.verifyUserIsParticipant(trip_id, user_id);
    if (!is_participant) {
      this.logger.warn(
        `User is not a participant: trip_id=${trip_id}, user_id=${user_id}`,
      );
      throw new ForbiddenException(
        'No eres participante de este viaje',
      );
    }

    // Verify trip exists and is active
    await this.verifyTripExistsAndActive(trip_id);

    // Verify category exists and is active
    await this.verifyCategoryExistsAndActive(
      create_expense_dto.category_id,
    );

    // Extract beneficiary user IDs
    const beneficiary_user_ids = create_expense_dto.beneficiaries.map(
      (b) => b.user_id,
    );

    // Verify all beneficiaries are participants
    await this.verifyBeneficiariesAreParticipants(
      trip_id,
      beneficiary_user_ids,
    );

    // Use transaction to ensure consistency
    const query_runner = this.dataSource.createQueryRunner();
    await query_runner.connect();
    await query_runner.startTransaction();

    try {
      // Create expense
      const expense = this.expenseRepository.create({
        tripId: trip_id,
        payerId: user_id,
        categoryId: create_expense_dto.category_id,
        title: create_expense_dto.title,
        amount: create_expense_dto.amount,
        receiptUrl: create_expense_dto.receipt_url || null,
        expenseDate: new Date(create_expense_dto.expense_date),
      });

      const saved_expense = await query_runner.manager.save(Expense, expense);

      // Create expense splits
      const splits: ExpenseSplit[] = [];
      const beneficiary_count = create_expense_dto.beneficiaries.length;

      for (const beneficiary of create_expense_dto.beneficiaries) {
        const amount_owed =
          beneficiary.amount_owed !== undefined
            ? beneficiary.amount_owed
            : this.calculateFairShare(
                create_expense_dto.amount,
                beneficiary_count,
              );

        const split = this.expenseSplitRepository.create({
          expenseId: saved_expense.id,
          userId: beneficiary.user_id,
          amountOwed: amount_owed,
        });

        splits.push(split);
      }

      await query_runner.manager.save(ExpenseSplit, splits);

      // Commit transaction
      await query_runner.commitTransaction();

      // Load expense with relations for response
      const expense_with_relations = await this.expenseRepository.findOne({
        where: { id: saved_expense.id, deletedAt: IsNull() },
        relations: ['splits', 'category'],
      });

      if (!expense_with_relations) {
        throw new NotFoundException('Error al recuperar el gasto creado');
      }

      // Map to response DTO
      return this.mapToResponseDto(expense_with_relations);
    } catch (error) {
      // Rollback transaction on error
      await query_runner.rollbackTransaction();
      this.logger.error(
        `Failed to create expense: trip_id=${trip_id}, user_id=${user_id}`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );

      // Re-throw known exceptions
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Wrap unknown errors
      throw new BadRequestException(
        'No se pudo crear el gasto. Por favor, verifica los datos e intenta nuevamente',
      );
    } finally {
      // Release query runner
      await query_runner.release();
    }
  }

  /**
   * Retrieves all expenses for a trip with pagination and optional filters.
   * Only participants can view expenses.
   * Expenses are ordered by expense_date DESC, then createdAt DESC.
   *
   * @param trip_id - ID of the trip
   * @param user_id - ID of the user requesting the list
   * @param query_dto - DTO with pagination and filter parameters
   * @returns Paginated list of expenses with metadata
   * @throws ForbiddenException if user is not a participant
   * @throws NotFoundException if trip doesn't exist
   */
  async findAllByTrip(
    trip_id: string,
    user_id: string,
    query_dto: ExpenseListQueryDto,
  ): Promise<ExpenseListResponseDto> {
    // Verify user is participant
    const is_participant = await this.verifyUserIsParticipant(trip_id, user_id);
    if (!is_participant) {
      this.logger.warn(
        `User is not a participant: trip_id=${trip_id}, user_id=${user_id}`,
      );
      throw new ForbiddenException(
        'No eres participante de este viaje',
      );
    }

    // Verify trip exists (can be active or closed)
    await this.verifyTripExists(trip_id);

    // Sanitize pagination parameters
    const safe_page = Math.max(1, query_dto.page || 1);
    const safe_limit = Math.min(
      Math.max(1, query_dto.limit || 20),
      100,
    );
    const skip = (safe_page - 1) * safe_limit;

    // Build base query for counting (without pagination)
    const count_query_builder = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.tripId = :trip_id', { trip_id })
      .andWhere('expense.deletedAt IS NULL');

    // Build query for fetching expenses (with relations and pagination)
    const query_builder = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.splits', 'split')
      .leftJoinAndSelect('expense.category', 'category')
      .where('expense.tripId = :trip_id', { trip_id })
      .andWhere('expense.deletedAt IS NULL')
      .orderBy('expense.expenseDate', 'DESC')
      .addOrderBy('expense.createdAt', 'DESC')
      .skip(skip)
      .take(safe_limit);

    // Apply category filter if provided (to both queries)
    if (query_dto.category_id !== undefined) {
      count_query_builder.andWhere('expense.categoryId = :category_id', {
        category_id: query_dto.category_id,
      });
      query_builder.andWhere('expense.categoryId = :category_id', {
        category_id: query_dto.category_id,
      });
    }

    // Get total count for pagination metadata (before pagination)
    const total_count = await count_query_builder.getCount();

    // Execute query to get expenses (with pagination)
    const expenses = await query_builder.getMany();

    // Map expenses to DTOs
    const expense_dtos = expenses.map((expense) =>
      this.mapToResponseDto(expense),
    );

    // Calculate pagination metadata
    const meta = {
      total: total_count,
      page: safe_page,
      limit: safe_limit,
      hasMore: safe_page * safe_limit < total_count,
    };

    this.logger.log(
      `User ${user_id} retrieved ${expenses.length} expenses for trip ${trip_id}, page ${safe_page}`,
    );

    return {
      expenses: expense_dtos,
      meta,
    };
  }

  /**
   * Retrieves a specific expense by ID for a trip.
   * Only participants can view expenses.
   *
   * @param trip_id - ID of the trip
   * @param expense_id - ID of the expense
   * @param user_id - ID of the user requesting the expense
   * @returns Expense details with beneficiaries
   * @throws BadRequestException if UUIDs are invalid
   * @throws ForbiddenException if user is not a participant
   * @throws NotFoundException if trip or expense doesn't exist
   */
  async findOneById(
    trip_id: string,
    expense_id: string,
    user_id: string,
  ): Promise<ExpenseResponseDto> {
    // Validate UUIDs
    if (!isUUID(trip_id) || !isUUID(expense_id)) {
      this.logger.warn(
        `Invalid UUID format: trip_id=${trip_id}, expense_id=${expense_id}`,
      );
      throw new BadRequestException('ID de viaje o gasto inválido');
    }

    // Verify user is participant
    const is_participant = await this.verifyUserIsParticipant(trip_id, user_id);
    if (!is_participant) {
      this.logger.warn(
        `User is not a participant: trip_id=${trip_id}, user_id=${user_id}`,
      );
      throw new ForbiddenException(
        'No eres participante de este viaje',
      );
    }

    // Verify trip exists (can be active or closed)
    await this.verifyTripExists(trip_id);

    // Find expense with relations
    const expense = await this.expenseRepository.findOne({
      where: {
        id: expense_id,
        tripId: trip_id,
        deletedAt: IsNull(),
      },
      relations: ['splits', 'category'],
    });

    if (!expense) {
      this.logger.warn(
        `Expense not found or doesn't belong to trip: trip_id=${trip_id}, expense_id=${expense_id}`,
      );
      throw new NotFoundException(
        'El gasto no existe o no pertenece a este viaje',
      );
    }

    this.logger.log(
      `User ${user_id} retrieved expense ${expense_id} for trip ${trip_id}`,
    );

    // Map and return
    return this.mapToResponseDto(expense);
  }

  /**
   * Maps Expense entity to ExpenseResponseDto.
   *
   * @param expense - Expense entity with relations loaded
   * @returns ExpenseResponseDto
   */
  private mapToResponseDto(expense: Expense): ExpenseResponseDto {
    return {
      id: expense.id,
      trip_id: expense.tripId,
      payer_id: expense.payerId,
      category_id: expense.categoryId,
      category_name: expense.category.name,
      title: expense.title,
      amount: Number(expense.amount),
      receipt_url: expense.receiptUrl,
      expense_date: expense.expenseDate,
      beneficiaries: expense.splits.map((split) => ({
        user_id: split.userId,
        amount_owed: Number(split.amountOwed),
      })),
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }
}
