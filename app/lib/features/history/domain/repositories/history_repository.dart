import '../entities/game_detail.dart';
import '../entities/game_history_item.dart';
import '../entities/game_history_source.dart';

abstract class HistoryRepository {
  Future<List<GameHistoryItem>> getGameHistory();

  Future<GameDetail> getGameDetail({
    required String gameId,
    required GameHistorySource source,
  });

  Future<void> deleteLocalGame(String gameId);

  Future<void> hideCloudGame(String gameId);
}
