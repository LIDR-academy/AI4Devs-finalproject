import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';

class GameRepositoryImpl implements GameRepository {
  GameRepositoryImpl(this._localDatasource);

  final GameLocalDatasource _localDatasource;

  @override
  Future<Game> saveDraft(Game game) => _localDatasource.insertGame(game);

  @override
  Future<Game?> getGameById(String id) => _localDatasource.getGameById(id);

  @override
  Future<Game> updateGamePlayers(
    String gameId,
    List<PlayerEmbed> players,
  ) =>
      _localDatasource.updateGamePlayers(gameId, players);
}
