import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/services/round_sequence_builder.dart';
import 'package:la_pocha/features/game_setup/domain/value_objects/game_deck_config.dart';
import 'package:uuid/uuid.dart';

class CreateGameDraftUseCase {
  CreateGameDraftUseCase(this._repository, {Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  final GameRepository _repository;
  final Uuid _uuid;

  Future<Game> call({required int playerCount}) async {
    if (playerCount < 3 || playerCount > 8) {
      throw ArgumentError.value(
        playerCount,
        'playerCount',
        'Must be between 3 and 8',
      );
    }

    final config = GameDeckConfig.fromPlayerCount(playerCount);
    final roundSequence = buildRoundSequence(
      maxCardsPerRound: config.maxCardsPerRound,
      playerCount: playerCount,
    );
    final now = DateTime.now();

    final game = Game(
      id: _uuid.v4(),
      status: GameStatus.setup,
      playerCount: playerCount,
      totalCards: config.totalCards,
      maxCardsPerRound: config.maxCardsPerRound,
      roundSequence: roundSequence,
      createdAt: now,
      updatedAt: now,
    );

    return _repository.saveDraft(game);
  }
}
