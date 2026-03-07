import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { ExpenseSplit } from './entities/expense-split.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { Trip } from '../trips/entities/trip.entity';
import { TripParticipant } from '../trips/entities/trip-participant.entity';
import { User } from '../users/entities/user.entity';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpensesService } from './services/expenses.service';

/**
 * Expenses Module.
 *
 * This module manages operations related to expenses and expense splits.
 *
 * Structure (CSED Pattern):
 * - Controller: Handles HTTP requests for expense management
 * - Service: Contains business logic and data access using TypeORM
 * - Entity: Defines data models for Expense, ExpenseSplit, and ExpenseCategory
 * - DTO: Defines validation and response contracts for the API
 *
 * Endpoints:
 * - GET /trips/:trip_id/expenses - List expenses for a trip with pagination (requires authentication)
 * - GET /trips/:trip_id/expenses/:expense_id - Get expense details (requires authentication)
 * - POST /trips/:trip_id/expenses - Create a new expense (requires authentication)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      ExpenseSplit,
      ExpenseCategory,
      Trip,
      TripParticipant,
      User,
    ]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
