import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/services/game_cloner_service.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/usecases/get_game_detail_usecase.dart';
import 'package:uuid/uuid.dart';

class RepeatGameUseCase {
  RepeatGameUseCase(
    this._getGameDetail,
    this._gameRepository,
    this._gameCloner, {
    Uuid? uuid,
  }) : _uuid = uuid ?? const Uuid();

  final GetGameDetailUseCase _getGameDetail;
  final GameRepository _gameRepository;
  final GameClonerService _gameCloner;
  final Uuid _uuid;

  Future<String> call({
    required String sourceGameId,
    required GameHistorySource source,
  }) async {
    final detail = await _getGameDetail(
      gameId: sourceGameId,
      source: source,
    );
    final now = DateTime.now();
    final cloned = _gameCloner.cloneForRepeat(
      source: detail.game,
      newGameId: _uuid.v4(),
      now: now,
      generatePlayerId: _uuid.v4,
    );

    final saved = await _gameRepository.saveDraft(cloned);
    return saved.id;
  }
}
