import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/presentation/bloc/favorites_bloc.dart';
import 'package:la_pocha/features/favorites/presentation/pages/favorites_page.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'favorites_page_test.mocks.dart';

@GenerateNiceMocks([MockSpec<FavoritesBloc>()])
void main() {
  late MockFavoritesBloc favoritesBloc;
  final getIt = GetIt.instance;

  provideDummy<FavoritesState>(const FavoritesInitial());

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
    favoritesBloc = MockFavoritesBloc();
    when(favoritesBloc.stream).thenAnswer((_) => const Stream.empty());
    when(favoritesBloc.close()).thenAnswer((_) async {});
    when(favoritesBloc.add(any)).thenReturn(null);
    when(favoritesBloc.state).thenReturn(const FavoritesInitial());

    if (getIt.isRegistered<FavoritesBloc>()) {
      getIt.unregister<FavoritesBloc>();
    }
    getIt.registerFactory<FavoritesBloc>(() => favoritesBloc);
  });

  tearDown(() {
    if (getIt.isRegistered<FavoritesBloc>()) {
      getIt.unregister<FavoritesBloc>();
    }
  });

  testWidgets('shows empty state when there are no favorites', (tester) async {
    when(favoritesBloc.state).thenReturn(const FavoritesEmpty());

    await tester.pumpWidget(
      const MaterialApp(home: FavoritesPage()),
    );
    await tester.pump();

    expect(find.text('Sin favoritos'), findsOneWidget);
    expect(find.text('Añadir favorito'), findsOneWidget);
  });

  testWidgets('shows favorites list when loaded', (tester) async {
    when(favoritesBloc.state).thenReturn(FavoritesLoaded(favorites: favorites));

    await tester.pumpWidget(
      const MaterialApp(home: FavoritesPage()),
    );
    await tester.pump();

    expect(find.text('Ana'), findsOneWidget);
    expect(find.text('Carlos'), findsOneWidget);
    expect(find.text('Usuario registrado'), findsOneWidget);
    expect(find.text('Invitado'), findsOneWidget);
  });
}
