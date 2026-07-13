import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';

class RepeatRoundUseCase {
  RepeatRoundUseCase(this._gameRepository, this._roundRepository);

  final GameRepository _gameRepository;
  final RoundRepository _roundRepository;

  Future<Round> call({
    required String gameId,
    required int roundNumber,
  }) async {
    final game = await _gameRepository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    if (game.currentRoundNumber != roundNumber) {
      throw StateError('Only the current round can be repeated');
    }

    final round = await _roundRepository.getRoundByGameAndNumber(
      gameId,
      roundNumber,
    );
    if (round == null) {
      throw StateError('Round not found: $gameId round $roundNumber');
    }

    if (round.status == RoundStatus.closed) {
      throw StateError('Closed rounds cannot be repeated');
    }

    if (round.status != RoundStatus.bidding &&
        round.status != RoundStatus.playing) {
      throw StateError('Round cannot be repeated in status ${round.status}');
    }

    final delta = round.scoresDelta ?? const <String, int>{};
    final updatedPlayers = game.players
        .map(
          (player) => player.copyWith(
            totalScore: player.totalScore - (delta[player.id] ?? 0),
          ),
        )
        .toList();

    final resetRound = round.resetToBidding();

    return _gameRepository.repeatRoundAndRevertScores(
      resetRound: resetRound,
      updatedPlayers: updatedPlayers,
    );
  }
}
