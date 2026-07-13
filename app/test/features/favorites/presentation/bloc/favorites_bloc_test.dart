import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/usecases/add_favorite_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/get_favorites_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/remove_favorite_usecase.dart';
import 'package:la_pocha/features/favorites/presentation/bloc/favorites_bloc.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'favorites_bloc_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GetFavoritesUseCase>(),
  MockSpec<AddFavoriteUseCase>(),
  MockSpec<RemoveFavoriteUseCase>(),
])
void main() {
  late MockGetFavoritesUseCase getFavorites;
  late MockAddFavoriteUseCase addFavorite;
  late MockRemoveFavoriteUseCase removeFavorite;

  final favorites = [
    FavoritePlayer(
      id: 'fav-1',
      displayName: 'Ana',
      userId: null,
      createdAt: DateTime(2026),
    ),
    FavoritePlayer(
      id: 'fav-2',
      displayName: 'Carlos',
      userId: 'user-1',
      createdAt: DateTime(2026),
    ),
  ];

  setUp(() {
    getFavorites = MockGetFavoritesUseCase();
    addFavorite = MockAddFavoriteUseCase();
    removeFavorite = MockRemoveFavoriteUseCase();
  });

  FavoritesBloc buildBloc() => FavoritesBloc(
        getFavorites: getFavorites,
        addFavorite: addFavorite,
        removeFavorite: removeFavorite,
      );

  blocTest<FavoritesBloc, FavoritesState>(
    'emits loaded when favorites exist',
    build: buildBloc,
    setUp: () {
      when(getFavorites()).thenAnswer((_) async => favorites);
    },
    act: (bloc) => bloc.add(const FavoritesStarted()),
    expect: () => [
      const FavoritesLoading(),
      FavoritesLoaded(favorites: favorites),
    ],
  );

  blocTest<FavoritesBloc, FavoritesState>(
    'emits empty when no favorites exist',
    build: buildBloc,
    setUp: () {
      when(getFavorites()).thenAnswer((_) async => []);
    },
    act: (bloc) => bloc.add(const FavoritesStarted()),
    expect: () => [
      const FavoritesLoading(),
      const FavoritesEmpty(),
    ],
  );

  blocTest<FavoritesBloc, FavoritesState>(
    'adds favorite to loaded list',
    build: buildBloc,
    seed: () => FavoritesLoaded(favorites: [favorites.first]),
    setUp: () {
      when(addFavorite(displayName: 'Luis', userId: null)).thenAnswer(
        (_) async => FavoritePlayer(
          id: 'fav-3',
          displayName: 'Luis',
          userId: null,
          createdAt: DateTime(2026),
        ),
      );
    },
    act: (bloc) => bloc.add(const FavoriteAdded(displayName: 'Luis')),
    expect: () => [
      FavoritesLoaded(
        favorites: [
          favorites.first,
          FavoritePlayer(
            id: 'fav-3',
            displayName: 'Luis',
            userId: null,
            createdAt: DateTime(2026),
          ),
        ],
      ),
    ],
  );

  blocTest<FavoritesBloc, FavoritesState>(
    'removes favorite optimistically from loaded list',
    build: buildBloc,
    seed: () => FavoritesLoaded(favorites: favorites),
    act: (bloc) => bloc.add(const FavoriteRemoved('fav-1')),
    expect: () => [
      FavoritesLoaded(favorites: [favorites.last]),
    ],
    verify: (_) {
      verify(removeFavorite('fav-1')).called(1);
    },
  );

  blocTest<FavoritesBloc, FavoritesState>(
    'emits empty when last favorite is removed',
    build: buildBloc,
    seed: () => FavoritesLoaded(favorites: [favorites.first]),
    act: (bloc) => bloc.add(const FavoriteRemoved('fav-1')),
    expect: () => [const FavoritesEmpty()],
  );
}
