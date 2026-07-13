import '../entities/game_history_item.dart';

abstract class HistoryRepository {
  Future<List<GameHistoryItem>> getGameHistory();
}
