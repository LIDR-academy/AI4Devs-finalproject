import 'package:la_pocha/features/history/domain/repositories/history_repository.dart';

class HideCloudGameUseCase {
  HideCloudGameUseCase(this._historyRepository);

  final HistoryRepository _historyRepository;

  Future<void> call({required String gameId}) async {
    await _historyRepository.hideCloudGame(gameId);
  }
}
