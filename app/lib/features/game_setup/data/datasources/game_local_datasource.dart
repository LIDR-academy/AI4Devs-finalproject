import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/mappers/game_mapper.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';

class GameLocalDatasource {
  GameLocalDatasource(this._database);

  final AppDatabase _database;

  Future<Game> insertGame(Game game) async {
    await _database.into(_database.games).insert(GameMapper.toCompanion(game));
    final entry = await (_database.select(_database.games)
          ..where((table) => table.id.equals(game.id)))
        .getSingle();
    return GameMapper.toDomain(entry);
  }
}
