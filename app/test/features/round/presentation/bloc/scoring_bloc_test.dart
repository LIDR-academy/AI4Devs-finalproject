import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/round/domain/entities/round_play_state.dart';
import 'package:la_pocha/features/round/domain/usecases/close_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_tricks_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/scoring_state.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'scoring_bloc_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GetRoundPlayStateUseCase>(),
  MockSpec<SubmitTricksUseCase>(),
  MockSpec<CloseRoundUseCase>(),
])
void main() {
  late MockGetRoundPlayStateUseCase getRoundPlayState;
  late MockSubmitTricksUseCase submitTricks;
  late MockCloseRoundUseCase closeRound;

  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 0,
      totalScore: 10,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p2',
      displayName: 'Bob',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 5,
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
    dealerPlayerId: 'p1',
    status: RoundStatus.playing,
    bids: const {'p1': 2, 'p2': 2},
    createdAt: DateTime(2026),
  );

  final playState = RoundPlayState(
    game: game,
    round: round,
    players: players,
    bidSum: 4,
    restrictionMet: false,
  );

  ScoringBloc buildBloc() {
    return ScoringBloc(
      getRoundPlayState: getRoundPlayState,
      submitTricks: submitTricks,
      closeRound: closeRound,
    );
  }

  setUp(() {
    getRoundPlayState = MockGetRoundPlayStateUseCase();
    submitTricks = MockSubmitTricksUseCase();
    closeRound = MockCloseRoundUseCase();

    when(
      submitTricks.previewScoresDelta(
        round: anyNamed('round'),
        tricks: anyNamed('tricks'),
        playerIds: anyNamed('playerIds'),
      ),
    ).thenAnswer((invocation) {
      final tricks = invocation.namedArguments[#tricks] as Map<String, int>;
      return {
        for (final entry in tricks.entries)
          entry.key: entry.value == 2 ? 20 : 0,
      };
    });
  });

  blocTest<ScoringBloc, ScoringState>(
    'loads scoring state with zero draft tricks',
    build: buildBloc,
    setUp: () {
      when(
        getRoundPlayState(
          gameId: anyNamed('gameId'),
          roundNumber: anyNamed('roundNumber'),
        ),
      ).thenAnswer((_) async => playState);
    },
    act: (bloc) => bloc.add(
      const ScoringStarted(gameId: 'game-1', roundNumber: 1),
    ),
    expect: () => [
      const ScoringLoading(),
      isA<ScoringLoaded>()
          .having((s) => s.draftTricks, 'draftTricks', {'p1': 0, 'p2': 0})
          .having((s) => s.canConfirm, 'canConfirm', false)
          .having((s) => s.tricksSum, 'tricksSum', 0),
    ],
  );

  blocTest<ScoringBloc, ScoringState>(
    'updates draft tricks and enables confirm when sum matches',
    build: buildBloc,
    seed: () => ScoringLoaded(
      game: game,
      round: round,
      players: players,
      draftTricks: const {'p1': 0, 'p2': 0},
      tricksSum: 0,
      canConfirm: false,
      scoresPreview: const {},
    ),
    act: (bloc) async {
      bloc.add(const TrickValueChanged(playerId: 'p1', value: 2));
      bloc.add(const TrickValueChanged(playerId: 'p2', value: 2));
    },
    expect: () => [
      isA<ScoringLoaded>()
          .having((s) => s.draftTricks['p1'], 'p1 tricks', 2)
          .having((s) => s.canConfirm, 'canConfirm', false),
      isA<ScoringLoaded>()
          .having((s) => s.tricksSum, 'tricksSum', 4)
          .having((s) => s.canConfirm, 'canConfirm', true),
    ],
  );

  blocTest<ScoringBloc, ScoringState>(
    'closes round and navigates to result',
    build: buildBloc,
    setUp: () {
      when(
        closeRound(
          gameId: anyNamed('gameId'),
          round: anyNamed('round'),
          players: anyNamed('players'),
          tricks: anyNamed('tricks'),
        ),
      ).thenAnswer((_) async => round.copyWith(status: RoundStatus.closed));
    },
    seed: () => ScoringLoaded(
      game: game,
      round: round,
      players: players,
      draftTricks: const {'p1': 2, 'p2': 2},
      tricksSum: 4,
      canConfirm: true,
      scoresPreview: const {'p1': 20, 'p2': 20},
    ),
    act: (bloc) => bloc.add(const CloseRoundRequested()),
    expect: () => [
      isA<ScoringLoaded>().having((s) => s.isClosing, 'isClosing', true),
      isA<ScoringNavigateToResult>()
          .having((s) => s.gameId, 'gameId', 'game-1')
          .having((s) => s.roundNumber, 'roundNumber', 1),
    ],
  );

  blocTest<ScoringBloc, ScoringState>(
    'does not close when tricks sum is invalid',
    build: buildBloc,
    seed: () => ScoringLoaded(
      game: game,
      round: round,
      players: players,
      draftTricks: const {'p1': 2, 'p2': 1},
      tricksSum: 3,
      canConfirm: false,
      scoresPreview: const {'p1': 20, 'p2': 15},
    ),
    act: (bloc) => bloc.add(const CloseRoundRequested()),
    expect: () => [],
    verify: (_) {
      verifyNever(
        closeRound(
          gameId: anyNamed('gameId'),
          round: anyNamed('round'),
          players: anyNamed('players'),
          tricks: anyNamed('tricks'),
        ),
      );
    },
  );
}
