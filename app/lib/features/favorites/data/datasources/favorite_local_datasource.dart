import 'package:drift/drift.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/favorites/data/models/favorite_player_model.dart';

class FavoriteLocalDatasource {
  FavoriteLocalDatasource(this._database);

  final AppDatabase _database;

  Future<List<FavoritePlayerModel>> getAll() async {
    final rows = await (_database.select(_database.favorites)
          ..orderBy([(table) => OrderingTerm.asc(table.createdAt)]))
        .get();

    return rows.map(FavoritePlayerModel.fromEntry).toList();
  }

  Future<void> insert(FavoritePlayerModel model) async {
    await _database.into(_database.favorites).insert(model.toCompanion());
  }

  Future<void> deleteById(String id) async {
    await (_database.delete(_database.favorites)
          ..where((table) => table.id.equals(id)))
        .go();
  }
}
