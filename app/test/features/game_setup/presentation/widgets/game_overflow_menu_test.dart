import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:go_router/go_router.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/cancel_game_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/cancel_game_cubit.dart';
import 'package:la_pocha/features/game_setup/presentation/widgets/game_overflow_menu.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'game_overflow_menu_test.mocks.dart';

@GenerateNiceMocks([MockSpec<CancelGameUseCase>()])
void main() {
  late MockCancelGameUseCase cancelGame;
  final getIt = GetIt.instance;

  setUp(() async {
    cancelGame = MockCancelGameUseCase();
    when(cancelGame(gameId: anyNamed('gameId'))).thenAnswer((_) async {});

    await getIt.reset();
    getIt.registerFactory<CancelGameUseCase>(() => cancelGame);
    getIt.registerFactory<CancelGameCubit>(
      () => CancelGameCubit(cancelGame: getIt()),
    );
  });

  Widget buildApp() {
    final router = GoRouter(
      initialLocation: '/game',
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) =>
              const Scaffold(body: Text('HOME SCREEN')),
        ),
        GoRoute(
          path: '/game',
          builder: (context, state) => const Scaffold(
            body: SafeArea(child: GameOverflowMenu(gameId: 'game-1')),
          ),
        ),
      ],
    );
    return MaterialApp.router(routerConfig: router);
  }

  Future<void> openMenuAndTapCancel(WidgetTester tester) async {
    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Cancelar partida').last);
    await tester.pumpAndSettle();
  }

  testWidgets('shows confirmation dialog when tapping "Cancelar partida"', (
    tester,
  ) async {
    await tester.pumpWidget(buildApp());

    await openMenuAndTapCancel(tester);

    expect(find.text('Volver'), findsOneWidget);
    expect(
      find.textContaining('Se perdera todo el progreso'),
      findsOneWidget,
    );
  });

  testWidgets('does not delete the game when confirmation is dismissed', (
    tester,
  ) async {
    await tester.pumpWidget(buildApp());

    await openMenuAndTapCancel(tester);
    await tester.tap(find.text('Volver'));
    await tester.pumpAndSettle();

    verifyNever(cancelGame(gameId: anyNamed('gameId')));
    expect(find.text('HOME SCREEN'), findsNothing);
  });

  testWidgets('deletes the game and navigates home when confirmed', (
    tester,
  ) async {
    await tester.pumpWidget(buildApp());

    await openMenuAndTapCancel(tester);
    await tester.tap(find.widgetWithText(TextButton, 'Cancelar partida'));
    await tester.pumpAndSettle();

    verify(cancelGame(gameId: 'game-1')).called(1);
    expect(find.text('HOME SCREEN'), findsOneWidget);
  });
}
