import '../entities/game_history_item.dart';
import '../repositories/history_repository.dart';

class GetGameHistoryUseCase {
  const GetGameHistoryUseCase(this._repository);

  final HistoryRepository _repository;

  Future<List<GameHistoryItem>> call() => _repository.getGameHistory();
}
