import 'package:la_pocha/features/sync/domain/repositories/game_sync_repository.dart';
import 'package:la_pocha/features/sync/domain/usecases/upload_finished_game_usecase.dart';

class RetryPendingUploadsUseCase {
  RetryPendingUploadsUseCase({
    required this._gameSyncRepository,
    required this._uploadFinishedGame,
  });

  final GameSyncRepository _gameSyncRepository;
  final UploadFinishedGameUseCase _uploadFinishedGame;

  Future<int> call() async {
    final pendingGames = await _gameSyncRepository.getPendingGames();
    var syncedCount = 0;

    for (final game in pendingGames) {
      final outcome = await _uploadFinishedGame(gameId: game.id);
      if (outcome == UploadFinishedGameOutcome.synced) {
        syncedCount++;
      }
    }

    return syncedCount;
  }
}
