import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';
import 'package:la_pocha/features/round/domain/entities/round_result.dart';
import 'package:la_pocha/features/round/domain/usecases/advance_to_next_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/finish_game_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_result_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/round_result_state.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'round_result_bloc_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GetRoundResultUseCase>(),
  MockSpec<AdvanceToNextRoundUseCase>(),
  MockSpec<FinishGameUseCase>(),
])
void main() {
  late MockGetRoundResultUseCase getRoundResult;
  late MockAdvanceToNextRoundUseCase advanceToNextRound;
  late MockFinishGameUseCase finishGame;

  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 20,
      joinedAt: DateTime(2026),
    ),
  ];

  final game = Game(
    id: 'game-1',
    status: GameStatus.inProgress,
    playerCount: 1,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [
      RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
      RoundDefinition(roundNumber: 2, cardsPerPlayer: 5),
    ],
    players: players,
    currentRoundNumber: 1,
    startedAt: DateTime(2026),
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  final closedRound = Round(
    id: 'round-1',
    gameId: 'game-1',
    roundNumber: 1,
    cardsInRound: 4,
    dealerPlayerId: 'p1',
    status: RoundStatus.closed,
    bids: const {'p1': 2},
    tricks: const {'p1': 2},
    scoresDelta: const {'p1': 10},
    createdAt: DateTime(2026),
    closedAt: DateTime(2026),
  );

  RoundResult buildResult({required bool isLastRound, int roundNumber = 1}) {
    return RoundResult(
      game: game,
      round: closedRound.copyWith(roundNumber: roundNumber),
      entries: [
        RankingEntry(
          player: players.first,
          rank: 1,
          roundScore: 10,
          totalScore: 20,
          positionDelta: 0,
        ),
      ],
      dealerDisplayName: 'Ana',
      isLastRound: isLastRound,
    );
  }

  setUp(() {
    getRoundResult = MockGetRoundResultUseCase();
    advanceToNextRound = MockAdvanceToNextRoundUseCase();
    finishGame = MockFinishGameUseCase();
  });

  RoundResultBloc buildBloc() => RoundResultBloc(
        getRoundResult: getRoundResult,
        advanceToNextRound: advanceToNextRound,
        finishGame: finishGame,
      );

  blocTest<RoundResultBloc, RoundResultState>(
    'loads round result on start',
    build: buildBloc,
    act: (bloc) => bloc.add(
      const RoundResultStarted(gameId: 'game-1', roundNumber: 1),
    ),
    setUp: () {
      when(
        getRoundResult(gameId: 'game-1', roundNumber: 1),
      ).thenAnswer((_) async => buildResult(isLastRound: false));
    },
    expect: () => [
      const RoundResultLoading(),
      isA<RoundResultLoaded>(),
    ],
  );

  blocTest<RoundResultBloc, RoundResultState>(
    'advances to next round when not last',
    build: buildBloc,
    seed: () => RoundResultLoaded(result: buildResult(isLastRound: false)),
    act: (bloc) => bloc.add(const AdvanceToNextRoundRequested()),
    setUp: () {
      when(
        advanceToNextRound(
          gameId: 'game-1',
          closedRound: anyNamed('closedRound'),
        ),
      ).thenAnswer(
        (_) async => closedRound.copyWith(
          id: 'round-2',
          roundNumber: 2,
          status: RoundStatus.bidding,
        ),
      );
    },
    expect: () => [
      isA<RoundResultAdvancing>(),
      const RoundResultNavigateToBids(gameId: 'game-1', roundNumber: 2),
    ],
  );

  blocTest<RoundResultBloc, RoundResultState>(
    'finishes game on last round',
    build: buildBloc,
    seed: () => RoundResultLoaded(
      result: buildResult(isLastRound: true, roundNumber: 2),
    ),
    act: (bloc) => bloc.add(const FinishGameRequested()),
    setUp: () {
      when(
        finishGame(
          gameId: 'game-1',
          closedRound: anyNamed('closedRound'),
        ),
      ).thenAnswer((_) async => game.copyWith(status: GameStatus.finished));
    },
    expect: () => [
      isA<RoundResultAdvancing>(),
      const RoundResultNavigateToFinal(gameId: 'game-1'),
    ],
  );
}
