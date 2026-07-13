import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/services/dealer_rotation_service.dart';

class AdvanceToNextRoundUseCase {
  AdvanceToNextRoundUseCase(
    this._gameRepository,
    this._dealerRotation,
  );

  final GameRepository _gameRepository;
  final DealerRotationService _dealerRotation;

  Future<Round> call({
    required String gameId,
    required Round closedRound,
  }) async {
    final game = await _gameRepository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    if (game.status != GameStatus.inProgress) {
      throw StateError('Game must be in progress to advance');
    }

    if (closedRound.status != RoundStatus.closed) {
      throw StateError('Current round must be closed to advance');
    }

    if (closedRound.roundNumber >= game.roundSequence.length) {
      throw StateError('Cannot advance beyond the last round');
    }

    final nextNumber = closedRound.roundNumber + 1;
    final nextDealerId = _dealerRotation.nextDealer(
      players: game.players,
      currentDealerId: closedRound.dealerPlayerId,
    );

    final now = DateTime.now();
    final nextRound = Round(
      id: '',
      gameId: gameId,
      roundNumber: nextNumber,
      cardsInRound: game.roundSequence[nextNumber - 1].cardsPerPlayer,
      dealerPlayerId: nextDealerId,
      status: RoundStatus.bidding,
      bids: const {},
      createdAt: now,
    );

    return _gameRepository.advanceToNextRound(
      nextRound: nextRound,
      nextRoundNumber: nextNumber,
    );
  }
}
