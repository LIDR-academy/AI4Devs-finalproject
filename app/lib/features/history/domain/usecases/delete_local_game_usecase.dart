import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/history/domain/repositories/history_repository.dart';

class DeleteLocalGameUseCase {
  DeleteLocalGameUseCase(this._historyRepository, this._gameRepository);

  final HistoryRepository _historyRepository;
  final GameRepository _gameRepository;

  Future<void> call({required String gameId}) async {
    final game = await _gameRepository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    if (game.status != GameStatus.finished) {
      throw StateError('Only finished games can be deleted from history');
    }

    await _historyRepository.deleteLocalGame(gameId);

    final cloudGameId = game.cloudGameId;
    if (cloudGameId != null) {
      await _historyRepository.hideCloudGame(cloudGameId);
    }
  }
}
