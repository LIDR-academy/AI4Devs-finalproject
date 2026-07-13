import 'package:drift/drift.dart';
import 'package:la_pocha/core/database/app_database.dart';

class HiddenGamesLocalDatasource {
  HiddenGamesLocalDatasource(this._database);

  final AppDatabase _database;

  Future<Set<String>> getHiddenGameIds() async {
    final rows = await _database.select(_database.hiddenGames).get();
    return rows.map((row) => row.gameId).toSet();
  }

  Future<void> hideGame(String gameId) async {
    await _database.into(_database.hiddenGames).insert(
          HiddenGamesCompanion.insert(gameId: gameId),
          mode: InsertMode.insertOrIgnore,
        );
  }

  Future<bool> isHidden(String gameId) async {
    final row = await (_database.select(_database.hiddenGames)
          ..where((table) => table.gameId.equals(gameId)))
        .getSingleOrNull();
    return row != null;
  }
}
