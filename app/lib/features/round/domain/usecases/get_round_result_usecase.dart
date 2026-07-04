import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/round/domain/entities/round_result.dart';
import 'package:la_pocha/features/round/domain/services/ranking_service.dart';

class GetRoundResultUseCase {
  GetRoundResultUseCase(
    this._gameRepository,
    this._roundRepository, {
    RankingService? rankingService,
  }) : _rankingService = rankingService ?? const RankingService();

  final GameRepository _gameRepository;
  final RoundRepository _roundRepository;
  final RankingService _rankingService;

  Future<RoundResult> call({
    required String gameId,
    required int roundNumber,
  }) async {
    final game = await _gameRepository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    final round = await _roundRepository.getRoundByGameAndNumber(
      gameId,
      roundNumber,
    );
    if (round == null) {
      throw StateError('Round not found: $gameId/$roundNumber');
    }

    if (round.status != RoundStatus.closed) {
      throw StateError('Round is not closed');
    }

    final scoresDelta = round.scoresDelta;
    if (scoresDelta == null) {
      throw StateError('Round has no scores delta');
    }

    final dealer = game.players.firstWhere(
      (player) => player.id == round.dealerPlayerId,
      orElse: () => throw StateError('Dealer not found: ${round.dealerPlayerId}'),
    );

    final entries = _rankingService.buildRanking(
      players: game.players,
      scoresDelta: scoresDelta,
    );

    return RoundResult(
      game: game,
      round: round,
      entries: entries,
      dealerDisplayName: dealer.displayName,
      isLastRound: roundNumber >= game.roundSequence.length,
    );
  }
}
