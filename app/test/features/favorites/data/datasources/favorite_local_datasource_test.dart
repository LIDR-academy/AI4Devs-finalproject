import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/favorites/data/datasources/favorite_local_datasource.dart';
import 'package:la_pocha/features/favorites/data/models/favorite_player_model.dart';

void main() {
  late AppDatabase database;
  late FavoriteLocalDatasource datasource;

  setUp(() {
    database = AppDatabase.forTesting();
    datasource = FavoriteLocalDatasource(database);
  });

  tearDown(() async {
    await database.close();
  });

  test('getAll returns empty list when no favorites exist', () async {
    final favorites = await datasource.getAll();

    expect(favorites, isEmpty);
  });

  test('insert persists favorite and getAll returns it ordered by createdAt',
      () async {
    final earlier = FavoritePlayerModel(
      id: 'fav-1',
      displayName: 'Ana',
      userId: null,
      createdAt: DateTime(2026, 1, 1),
    );
    final later = FavoritePlayerModel(
      id: 'fav-2',
      displayName: 'Carlos',
      userId: 'user-1',
      createdAt: DateTime(2026, 2, 1),
    );

    await datasource.insert(later);
    await datasource.insert(earlier);

    final favorites = await datasource.getAll();

    expect(favorites.length, 2);
    expect(favorites.first.displayName, 'Ana');
    expect(favorites.last.displayName, 'Carlos');
    expect(favorites.last.userId, 'user-1');
  });

  test('deleteById removes favorite from storage', () async {
    await datasource.insert(
      FavoritePlayerModel(
        id: 'fav-1',
        displayName: 'Ana',
        userId: null,
        createdAt: DateTime(2026),
      ),
    );

    await datasource.deleteById('fav-1');

    final favorites = await datasource.getAll();
    expect(favorites, isEmpty);
  });
}
