import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';

class RemovePlayerUseCase {
  RemovePlayerUseCase(this._repository);

  final GameRepository _repository;

  Future<Game?> call({
    required String gameId,
    required String playerId,
  }) async {
    final game = await _repository.getGameById(gameId);
    if (game == null) {
      return null;
    }

    final updatedPlayers =
        game.players.where((player) => player.id != playerId).toList();
    if (updatedPlayers.length == game.players.length) {
      return game;
    }

    return _repository.updateGamePlayers(gameId, updatedPlayers);
  }
}
