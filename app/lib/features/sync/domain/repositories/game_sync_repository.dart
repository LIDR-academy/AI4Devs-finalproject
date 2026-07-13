import 'package:la_pocha/features/game_setup/domain/entities/game.dart';

enum GameUploadResult {
  synced,
  skipped,
}

abstract class GameSyncRepository {
  Future<GameUploadResult> uploadFinishedGame({
    required String gameId,
    required String hostId,
  });

  Future<List<Game>> getPendingGames();
}
