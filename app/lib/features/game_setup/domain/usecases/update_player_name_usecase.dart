import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';

class UpdatePlayerNameUseCase {
  UpdatePlayerNameUseCase(this._repository);

  final GameRepository _repository;

  Future<Game> call({
    required String gameId,
    required String playerId,
    required String newName,
  }) async {
    final game = await _repository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    final trimmedName = newName.trim();
    if (trimmedName.isEmpty) {
      throw ArgumentError.value(newName, 'newName', 'Must not be empty');
    }

    final playerIndex = game.players.indexWhere((player) => player.id == playerId);
    if (playerIndex < 0) {
      throw StateError('Player not found: $playerId');
    }

    final currentPlayer = game.players[playerIndex];
    if (currentPlayer.displayName.toLowerCase() == trimmedName.toLowerCase()) {
      return game;
    }

    final isDuplicate = game.players.any(
      (player) =>
          player.id != playerId &&
          player.displayName.toLowerCase() == trimmedName.toLowerCase(),
    );
    if (isDuplicate) {
      throw ArgumentError.value(
        newName,
        'newName',
        'Player name already exists in this game',
      );
    }

    final updatedPlayers = [...game.players];
    updatedPlayers[playerIndex] = currentPlayer.copyWith(displayName: trimmedName);
    return _repository.updateGamePlayers(gameId, updatedPlayers);
  }
}
