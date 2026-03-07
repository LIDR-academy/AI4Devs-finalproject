import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { ExpenseSplit } from '../expenses/entities/expense-split.entity';
import { TripParticipant } from '../trips/entities/trip-participant.entity';
import { Trip } from '../trips/entities/trip.entity';
import { BalancesController } from './controllers/balances.controller';
import { BalancesService } from './services/balances.service';

/**
 * Balances Module.
 *
 * This module manages operations related to balance calculations and settlement.
 *
 * Structure (CSED Pattern):
 * - Controller: Handles HTTP requests for balance management
 * - Service: Contains business logic for calculating and settling balances
 * - DTO: Defines validation and response contracts for the API
 *
 * Endpoints:
 * - GET /trips/:trip_id/balances - Get balances for all participants (requires authentication)
 * - POST /trips/:trip_id/balances/settle - Settle balances with simplified transactions (requires authentication)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      ExpenseSplit,
      TripParticipant,
      Trip,
    ]),
  ],
  controllers: [BalancesController],
  providers: [BalancesService],
  exports: [BalancesService],
})
export class BalancesModule {}
