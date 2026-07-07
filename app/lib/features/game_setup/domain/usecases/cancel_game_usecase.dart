import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';

class CancelGameUseCase {
  CancelGameUseCase(this._repository);

  final GameRepository _repository;

  Future<void> call({required String gameId}) async {
    final game = await _repository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    if (game.status == GameStatus.finished) {
      throw StateError('Finished games cannot be cancelled');
    }

    await _repository.deleteGame(gameId);
  }
}
