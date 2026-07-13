import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/favorites/data/datasources/favorite_local_datasource.dart';
import 'package:la_pocha/features/favorites/data/repositories/favorite_repository_impl.dart';

void main() {
  late AppDatabase database;
  late FavoriteRepositoryImpl repository;

  setUp(() {
    database = AppDatabase.forTesting();
    repository = FavoriteRepositoryImpl(FavoriteLocalDatasource(database));
  });

  tearDown(() async {
    await database.close();
  });

  test('addFavorite persists and getFavorites returns it', () async {
    await repository.addFavorite(displayName: 'Ana');

    final favorites = await repository.getFavorites();

    expect(favorites.length, 1);
    expect(favorites.first.id, isNotEmpty);
    expect(favorites.first.displayName, 'Ana');
    expect(favorites.first.userId, isNull);
  });

  test('removeFavorite deletes favorite', () async {
    final favorite = await repository.addFavorite(displayName: 'Ana');

    await repository.removeFavorite(favorite.id);

    final favorites = await repository.getFavorites();
    expect(favorites, isEmpty);
  });

  test('addFavorite rejects duplicate userId', () async {
    await repository.addFavorite(
      displayName: 'Ana',
      userId: 'user-1',
    );

    expect(
      () => repository.addFavorite(
        displayName: 'Ana García',
        userId: 'user-1',
      ),
      throwsA(
        isA<ArgumentError>().having(
          (error) => error.message,
          'message',
          contains('user already exists'),
        ),
      ),
    );
  });

  test('addFavorite rejects duplicate displayName case-insensitively', () async {
    await repository.addFavorite(displayName: 'Ana');

    expect(
      () => repository.addFavorite(displayName: '  ana  '),
      throwsA(
        isA<ArgumentError>().having(
          (error) => error.message,
          'message',
          contains('display name already exists'),
        ),
      ),
    );
  });
}
