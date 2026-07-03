import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/round/domain/entities/round_play_state.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_bloc.dart';
import 'package:la_pocha/features/round/presentation/pages/play_page.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'play_page_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GetRoundPlayStateUseCase>()])
void main() {
  late MockGetRoundPlayStateUseCase getRoundPlayState;
  final getIt = GetIt.instance;

  final players = [
    PlayerEmbed(
      id: 'p0',
      displayName: 'Dealer',
      isGuest: true,
      userId: null,
      seatOrder: 0,
      totalScore: 42,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 38,
      joinedAt: DateTime(2026),
    ),
  ];

  final game = Game(
    id: 'game-1',
    status: GameStatus.inProgress,
    playerCount: 2,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [
      RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
    ],
    players: players,
    currentRoundNumber: 1,
    startedAt: DateTime(2026),
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  final round = Round(
    id: 'round-1',
    gameId: 'game-1',
    roundNumber: 1,
    cardsInRound: 4,
    dealerPlayerId: 'p0',
    status: RoundStatus.playing,
    bids: const {'p0': 0, 'p1': 2},
    createdAt: DateTime(2026),
  );

  final playState = RoundPlayState(
    game: game,
    round: round,
    players: players,
    bidSum: 2,
    restrictionMet: true,
  );

  setUp(() async {
    getRoundPlayState = MockGetRoundPlayStateUseCase();
    when(
      getRoundPlayState(
        gameId: anyNamed('gameId'),
        roundNumber: anyNamed('roundNumber'),
      ),
    ).thenAnswer((_) async => playState);

    await getIt.reset();
    getIt.registerFactory<GetRoundPlayStateUseCase>(() => getRoundPlayState);
    getIt.registerFactory<PlayStateBloc>(
      () => PlayStateBloc(getRoundPlayState: getIt()),
    );
  });

  testWidgets('renders bids, scores and balance banner with mock data', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const PlayPage(gameId: 'game-1', roundNumber: 1),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Dealer'), findsOneWidget);
    expect(find.text('Ana'), findsOneWidget);
    expect(find.text('42'), findsOneWidget);
    expect(find.text('38'), findsOneWidget);
    expect(find.text('2 / 4'), findsOneWidget);
    expect(find.text('Introducir bazas reales'), findsOneWidget);
    expect(find.text('Corregir apuestas'), findsOneWidget);
    expect(find.text('En juego'), findsOneWidget);
  });
}
