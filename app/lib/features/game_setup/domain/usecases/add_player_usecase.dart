import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:uuid/uuid.dart';

class AddPlayerUseCase {
  AddPlayerUseCase(this._repository, {Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  final GameRepository _repository;
  final Uuid _uuid;

  Future<Game> call({
    required String gameId,
    required String name,
  }) async {
    final game = await _repository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    final trimmedName = name.trim();
    if (trimmedName.isEmpty) {
      throw ArgumentError.value(name, 'name', 'Must not be empty');
    }

    final isDuplicate = game.players.any(
      (player) =>
          player.displayName.toLowerCase() == trimmedName.toLowerCase(),
    );
    if (isDuplicate) {
      throw ArgumentError.value(
        name,
        'name',
        'Player name already exists in this game',
      );
    }

    if (game.players.length >= game.playerCount) {
      throw ArgumentError('Player limit reached for this game');
    }

    final now = DateTime.now();
    final player = PlayerEmbed(
      id: _uuid.v4(),
      displayName: trimmedName,
      isGuest: true,
      userId: null,
      seatOrder: game.players.length,
      totalScore: 0,
      joinedAt: now,
    );

    final updatedPlayers = [...game.players, player];
    return _repository.updateGamePlayers(gameId, updatedPlayers);
  }
}
