import '../entities/game.dart';
import '../entities/player_embed.dart';

abstract class GameRepository {
  Future<Game> saveDraft(Game game);

  Future<Game?> getGameById(String id);

  Future<Game> updateGamePlayers(String gameId, List<PlayerEmbed> players);
}
