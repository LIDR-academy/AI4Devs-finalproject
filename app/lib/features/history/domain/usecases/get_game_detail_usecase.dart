import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/history/domain/entities/game_detail.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/repositories/history_repository.dart';

class GetGameDetailUseCase {
  GetGameDetailUseCase(this._repository);

  final HistoryRepository _repository;

  Future<GameDetail> call({
    required String gameId,
    required GameHistorySource source,
  }) async {
    final detail = await _repository.getGameDetail(
      gameId: gameId,
      source: source,
    );

    if (detail.game.status != GameStatus.finished) {
      throw StateError('Game is not finished: $gameId');
    }

    return detail;
  }
}
