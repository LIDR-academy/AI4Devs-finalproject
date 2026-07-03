import 'package:drift/drift.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/mappers/game_mapper.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

class GameLocalDatasource {
  GameLocalDatasource(this._database);

  final AppDatabase _database;

  Future<Game> insertGame(Game game) async {
    await _database.into(_database.games).insert(GameMapper.toCompanion(game));
    return _readGameById(game.id);
  }

  Future<Game?> getGameById(String id) async {
    final entries = await (_database.select(_database.games)
          ..where((table) => table.id.equals(id)))
        .get();
    if (entries.isEmpty) {
      return null;
    }
    return GameMapper.toDomain(entries.first);
  }

  Future<Game> updateGamePlayers(
    String gameId,
    List<PlayerEmbed> players,
  ) async {
    await (_database.update(_database.games)
          ..where((table) => table.id.equals(gameId)))
        .write(
      GamesCompanion(
        players: Value(players),
        updatedAt: Value(DateTime.now()),
      ),
    );
    return _readGameById(gameId);
  }

  Future<Game> _readGameById(String id) async {
    final entry = await (_database.select(_database.games)
          ..where((table) => table.id.equals(id)))
        .getSingle();
    return GameMapper.toDomain(entry);
  }
}
