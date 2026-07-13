import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/repositories/favorite_repository.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:uuid/uuid.dart';

class AddPlayerFromFavoriteUseCase {
  AddPlayerFromFavoriteUseCase(
    this._gameRepository,
    this._favoriteRepository, {
    Uuid? uuid,
  }) : _uuid = uuid ?? const Uuid();

  final GameRepository _gameRepository;
  final FavoriteRepository _favoriteRepository;
  final Uuid _uuid;

  Future<Game> call({
    required String gameId,
    required String favoriteId,
  }) async {
    final favorites = await _favoriteRepository.getFavorites();
    FavoritePlayer? favorite;
    for (final item in favorites) {
      if (item.id == favoriteId) {
        favorite = item;
        break;
      }
    }
    if (favorite == null) {
      throw StateError('Favorite not found: $favoriteId');
    }
    final selectedFavorite = favorite;

    final game = await _gameRepository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    final isDuplicate = game.players.any(
      (player) =>
          player.displayName.toLowerCase() ==
              selectedFavorite.displayName.toLowerCase() ||
          (selectedFavorite.userId != null &&
              player.userId == selectedFavorite.userId),
    );
    if (isDuplicate) {
      throw ArgumentError.value(
        selectedFavorite.displayName,
        'displayName',
        'Player already exists in this game',
      );
    }

    if (game.players.length >= game.playerCount) {
      throw ArgumentError('Player limit reached for this game');
    }

    final now = DateTime.now();
    final player = PlayerEmbed(
      id: _uuid.v4(),
      displayName: selectedFavorite.displayName,
      isGuest: selectedFavorite.userId == null,
      userId: selectedFavorite.userId,
      seatOrder: game.players.length,
      totalScore: 0,
      joinedAt: now,
    );

    final updatedPlayers = [...game.players, player];
    return _gameRepository.updateGamePlayers(gameId, updatedPlayers);
  }
}
