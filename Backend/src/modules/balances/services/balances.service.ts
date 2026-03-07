import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';
import { ExpenseSplit } from '../../expenses/entities/expense-split.entity';
import { TripParticipant } from '../../trips/entities/trip-participant.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { ParticipantBalanceDto } from '../dto/participant-balance.dto';
import { BalancesResponseDto } from '../dto/balances-response.dto';
import { SettleTransactionDto } from '../dto/settle-transaction.dto';
import { SettleResponseDto } from '../dto/settle-response.dto';

/**
 * Service for Balances.
 * Responsibility: Contains business logic for calculating and settling balances.
 */
@Injectable()
export class BalancesService {
  private readonly logger = new Logger(BalancesService.name);

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseSplit)
    private readonly expenseSplitRepository: Repository<ExpenseSplit>,
    @InjectRepository(TripParticipant)
    private readonly tripParticipantRepository: Repository<TripParticipant>,
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
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
   * Verifies if a trip exists.
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
   * Calculates balances for all participants in a trip.
   * For each participant, calculates:
   * - total_spent: Sum of expenses where user is payer
   * - total_owed: Sum of amount_owed in expense_splits
   * - balance: total_spent - total_owed (positive = creditor, negative = debtor)
   *
   * @param trip_id - ID of the trip
   * @param user_id - ID of the user requesting balances
   * @returns Balances response with all participant balances
   * @throws ForbiddenException if user is not a participant
   * @throws NotFoundException if trip doesn't exist
   */
  async calculateBalances(
    trip_id: string,
    user_id: string,
  ): Promise<BalancesResponseDto> {
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

    // Verify trip exists
    await this.verifyTripExists(trip_id);

    // Get all active participants with user info
    const participants = await this.tripParticipantRepository.find({
      where: {
        tripId: trip_id,
        deletedAt: IsNull(),
      },
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        user: {
          id: true,
          nombre: true,
          email: true,
        },
      },
    });

    if (participants.length === 0) {
      return {
        trip_id,
        total_expenses: 0,
        participant_count: 0,
        balances: [],
      };
    }

    // Get total expenses for the trip
    const total_expenses_result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount), 0)', 'total')
      .where('expense.tripId = :trip_id', { trip_id })
      .andWhere('expense.deletedAt IS NULL')
      .getRawOne();

    const total_expenses = Number(total_expenses_result?.total || 0);

    // Calculate total spent per user (where user is payer)
    const total_spent_query = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.payerId', 'user_id')
      .addSelect('COALESCE(SUM(expense.amount), 0)', 'total_spent')
      .where('expense.tripId = :trip_id', { trip_id })
      .andWhere('expense.deletedAt IS NULL')
      .groupBy('expense.payerId')
      .getRawMany();

    const total_spent_map = new Map<string, number>();
    total_spent_query.forEach((row) => {
      total_spent_map.set(row.user_id, Number(row.total_spent));
    });

    // Calculate total owed per user (sum of amount_owed in expense_splits)
    const total_owed_query = await this.expenseSplitRepository
      .createQueryBuilder('split')
      .innerJoin('split.expense', 'expense')
      .select('split.userId', 'user_id')
      .addSelect('COALESCE(SUM(split.amountOwed), 0)', 'total_owed')
      .where('expense.tripId = :trip_id', { trip_id })
      .andWhere('expense.deletedAt IS NULL')
      .andWhere('split.deletedAt IS NULL')
      .groupBy('split.userId')
      .getRawMany();

    const total_owed_map = new Map<string, number>();
    total_owed_query.forEach((row) => {
      total_owed_map.set(row.user_id, Number(row.total_owed));
    });

    // Build balances array
    const balances: ParticipantBalanceDto[] = participants.map(
      (participant) => {
        const total_spent = total_spent_map.get(participant.userId) || 0;
        const total_owed = total_owed_map.get(participant.userId) || 0;
        const balance = Number((total_spent - total_owed).toFixed(2));

        return {
          user_id: participant.userId,
          user_name: participant.user.nombre,
          user_email: participant.user.email,
          total_spent: Number(total_spent.toFixed(2)),
          total_owed: Number(total_owed.toFixed(2)),
          balance,
        };
      },
    );

    this.logger.log(
      `Calculated balances for trip ${trip_id}, ${balances.length} participants`,
    );

    return {
      trip_id,
      total_expenses: Number(total_expenses.toFixed(2)),
      participant_count: participants.length,
      balances,
    };
  }

  /**
   * Simplifies debts using a greedy algorithm to minimize transactions.
   * Takes balances and returns simplified transactions.
   *
   * @param balances - Array of participant balances
   * @returns Array of simplified transactions
   */
  private simplifyDebts(
    balances: ParticipantBalanceDto[],
  ): SettleTransactionDto[] {
    const transactions: SettleTransactionDto[] = [];

    // Separate debtors (negative balance) and creditors (positive balance)
    const debtors = balances
      .filter((b) => b.balance < -0.01)
      .map((b) => ({ ...b }))
      .sort((a, b) => a.balance - b.balance); // Sort ascending (most negative first)

    const creditors = balances
      .filter((b) => b.balance > 0.01)
      .map((b) => ({ ...b }))
      .sort((a, b) => b.balance - a.balance); // Sort descending (most positive first)

    let debtor_index = 0;
    let creditor_index = 0;

    // Greedy algorithm: match largest debtor with largest creditor
    while (debtor_index < debtors.length && creditor_index < creditors.length) {
      const debtor = debtors[debtor_index];
      const creditor = creditors[creditor_index];

      // TypeScript guard: ensure both exist
      if (!debtor || !creditor) {
        break;
      }

      const amount = Math.min(
        Math.abs(debtor.balance),
        creditor.balance,
      );

      if (amount > 0.01) {
        transactions.push({
          from_user_id: debtor.user_id,
          from_user_name: debtor.user_name,
          to_user_id: creditor.user_id,
          to_user_name: creditor.user_name,
          amount: Number(amount.toFixed(2)),
        });

        debtor.balance = Number((debtor.balance + amount).toFixed(2));
        creditor.balance = Number((creditor.balance - amount).toFixed(2));
      }

      // Move to next debtor if balance is settled (within rounding tolerance)
      if (Math.abs(debtor.balance) < 0.01) {
        debtor_index++;
      }

      // Move to next creditor if balance is settled (within rounding tolerance)
      if (creditor.balance < 0.01) {
        creditor_index++;
      }
    }

    return transactions;
  }

  /**
   * Calculates simplified debt transactions to settle all balances.
   * Uses the balances calculation and then simplifies debts to minimize transactions.
   *
   * @param trip_id - ID of the trip
   * @param user_id - ID of the user requesting settlement
   * @returns Settle response with simplified transactions
   * @throws ForbiddenException if user is not a participant
   * @throws NotFoundException if trip doesn't exist
   */
  async settleBalances(
    trip_id: string,
    user_id: string,
  ): Promise<SettleResponseDto> {
    // Calculate balances first
    const balances_response = await this.calculateBalances(trip_id, user_id);

    // Simplify debts
    const transactions = this.simplifyDebts(balances_response.balances);

    this.logger.log(
      `Settled balances for trip ${trip_id}, ${transactions.length} transactions needed`,
    );

    return {
      trip_id,
      transactions,
      total_transactions: transactions.length,
    };
  }
}
