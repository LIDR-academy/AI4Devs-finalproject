import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';

class FinishGameUseCase {
  FinishGameUseCase(this._gameRepository);

  final GameRepository _gameRepository;

  Future<Game> call({
    required String gameId,
    required Round closedRound,
  }) async {
    final game = await _gameRepository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    if (game.status != GameStatus.inProgress) {
      throw StateError('Game must be in progress to finish');
    }

    if (closedRound.status != RoundStatus.closed) {
      throw StateError('Current round must be closed to finish game');
    }

    if (closedRound.roundNumber < game.roundSequence.length) {
      throw StateError('Cannot finish game before the last round');
    }

    return _gameRepository.finishGame(
      gameId: gameId,
      finishedAt: DateTime.now(),
    );
  }
}
