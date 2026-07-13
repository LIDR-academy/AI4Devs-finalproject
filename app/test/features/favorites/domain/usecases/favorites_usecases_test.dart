import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/repositories/favorite_repository.dart';
import 'package:la_pocha/features/favorites/domain/usecases/add_favorite_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/get_favorites_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/remove_favorite_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'favorites_usecases_test.mocks.dart';

@GenerateNiceMocks([MockSpec<FavoriteRepository>()])
void main() {
  late MockFavoriteRepository repository;
  late GetFavoritesUseCase getFavorites;
  late AddFavoriteUseCase addFavorite;
  late RemoveFavoriteUseCase removeFavorite;

  final favorites = [
    FavoritePlayer(
      id: 'fav-1',
      displayName: 'Ana',
      userId: null,
      createdAt: DateTime(2026),
    ),
  ];

  setUp(() {
    repository = MockFavoriteRepository();
    getFavorites = GetFavoritesUseCase(repository);
    addFavorite = AddFavoriteUseCase(repository);
    removeFavorite = RemoveFavoriteUseCase(repository);
  });

  test('getFavorites delegates to repository', () async {
    when(repository.getFavorites()).thenAnswer((_) async => favorites);

    final result = await getFavorites();

    expect(result, favorites);
    verify(repository.getFavorites()).called(1);
  });

  test('addFavorite delegates to repository', () async {
    when(
      repository.addFavorite(displayName: 'Ana', userId: null),
    ).thenAnswer((_) async => favorites.first);

    final result = await addFavorite(displayName: 'Ana');

    expect(result, favorites.first);
    verify(repository.addFavorite(displayName: 'Ana', userId: null)).called(1);
  });

  test('removeFavorite delegates to repository', () async {
    when(repository.removeFavorite('fav-1')).thenAnswer((_) async {});

    await removeFavorite('fav-1');

    verify(repository.removeFavorite('fav-1')).called(1);
  });

  test('addFavorite propagates deduplication errors', () async {
    when(
      repository.addFavorite(displayName: 'Ana', userId: null),
    ).thenThrow(
      ArgumentError('Favorite with this display name already exists'),
    );

    expect(
      () => addFavorite(displayName: 'Ana'),
      throwsA(isA<ArgumentError>()),
    );
  });
}
