import {
  Controller,
  Get,
  Post,
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
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { BalancesService } from '../services/balances.service';
import { BalancesResponseDto } from '../dto/balances-response.dto';
import { SettleResponseDto } from '../dto/settle-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';

/**
 * Controller for Balances.
 *
 * This controller handles HTTP requests related to balance calculations and settlement.
 * Its main responsibility is to handle HTTP requests and input validations,
 * delegating all business logic to BalancesService.
 */
@ApiTags('balances')
@Controller('trips/:trip_id')
@UseGuards(JwtAuthGuard)
export class BalancesController {
  constructor(private readonly balances_service: BalancesService) {}

  /**
   * Retrieves balances for all participants in a trip.
   * Shows total spent, total owed, and net balance for each participant.
   * Only participants can view balances.
   *
   * @method getBalances
   * @param {string} trip_id - ID of the trip
   * @param {AuthenticatedRequest} req - Request with authenticated user
   * @returns {BalancesResponseDto} Balances for all participants
   * @throws {ForbiddenException} If user is not a participant
   * @throws {NotFoundException} If trip doesn't exist
   * @example
   * // GET /trips/123e4567-e89b-12d3-a456-426614174000/balances
   * // Headers: Authorization: Bearer {token}
   * // Response: { trip_id: "...", total_expenses: 300000, participant_count: 3, balances: [...] }
   */
  @Get('balances')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get balances for all participants',
    description:
      'Retrieves balances for all participants in a trip. Shows total spent, total owed, and net balance for each participant. Only participants can view balances.',
  })
  @ApiParam({
    name: 'trip_id',
    description: 'ID del viaje',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Balances obtenidos exitosamente',
    type: BalancesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'ID de viaje inválido',
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
  async getBalances(
    @Param('trip_id', ParseUUIDPipe) trip_id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BalancesResponseDto> {
    return this.balances_service.calculateBalances(
      trip_id,
      req.user!.id,
    );
  }

  /**
   * Calculates simplified debt transactions to settle all balances.
   * Uses an algorithm to minimize the number of transactions needed.
   * Only participants can settle balances.
   *
   * @method settleBalances
   * @param {string} trip_id - ID of the trip
   * @param {AuthenticatedRequest} req - Request with authenticated user
   * @returns {SettleResponseDto} Simplified transactions to settle all debts
   * @throws {ForbiddenException} If user is not a participant
   * @throws {NotFoundException} If trip doesn't exist
   * @example
   * // POST /trips/123e4567-e89b-12d3-a456-426614174000/balances/settle
   * // Headers: Authorization: Bearer {token}
   * // Response: { trip_id: "...", transactions: [...], total_transactions: 2 }
   */
  @Post('balances/settle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Settle balances',
    description:
      'Calculates simplified debt transactions to settle all balances. Uses an algorithm to minimize the number of transactions needed. Only participants can settle balances.',
  })
  @ApiParam({
    name: 'trip_id',
    description: 'ID del viaje',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Transacciones simplificadas calculadas exitosamente',
    type: SettleResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'ID de viaje inválido',
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
  async settleBalances(
    @Param('trip_id', ParseUUIDPipe) trip_id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<SettleResponseDto> {
    return this.balances_service.settleBalances(
      trip_id,
      req.user!.id,
    );
  }
}
