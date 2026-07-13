import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/history/domain/entities/game_detail.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/entities/round_summary.dart';
import 'package:la_pocha/features/history/domain/usecases/get_game_detail_usecase.dart';
import 'package:la_pocha/features/history/presentation/bloc/game_detail_bloc.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'game_detail_bloc_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GetGameDetailUseCase>()])
void main() {
  late MockGetGameDetailUseCase getGameDetail;

  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 10,
      joinedAt: DateTime(2026),
    ),
  ];

  final game = Game(
    id: 'game-1',
    status: GameStatus.finished,
    playerCount: 1,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [RoundDefinition(roundNumber: 1, cardsPerPlayer: 4)],
    players: players,
    finishedAt: DateTime(2026),
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  final round = Round(
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

  GameDetail buildDetail(GameHistorySource source) {
    final ranking = [
      RankingEntry(
        player: players.first,
        rank: 1,
        roundScore: 10,
        totalScore: 10,
        positionDelta: null,
      ),
    ];

    return GameDetail(
      game: game,
      roundSummaries: [
        RoundSummary(
          round: round,
          dealerDisplayName: 'Ana',
          cumulativeRanking: ranking,
        ),
      ],
      finalRanking: ranking,
      source: source,
    );
  }

  setUp(() {
    getGameDetail = MockGetGameDetailUseCase();
  });

  GameDetailBloc buildBloc() =>
      GameDetailBloc(getGameDetail: getGameDetail);

  blocTest<GameDetailBloc, GameDetailState>(
    'emits loaded when local detail loads',
    build: buildBloc,
    setUp: () {
      when(
        getGameDetail(gameId: 'game-1', source: GameHistorySource.local),
      ).thenAnswer((_) async => buildDetail(GameHistorySource.local));
    },
    act: (bloc) => bloc.add(
      const GameDetailStarted(
        gameId: 'game-1',
        source: GameHistorySource.local,
      ),
    ),
    expect: () => [
      const GameDetailLoading(),
      GameDetailLoaded(detail: buildDetail(GameHistorySource.local)),
    ],
  );

  blocTest<GameDetailBloc, GameDetailState>(
    'emits loaded when cloud detail loads',
    build: buildBloc,
    setUp: () {
      when(
        getGameDetail(gameId: 'cloud-1', source: GameHistorySource.cloud),
      ).thenAnswer((_) async => buildDetail(GameHistorySource.cloud));
    },
    act: (bloc) => bloc.add(
      const GameDetailStarted(
        gameId: 'cloud-1',
        source: GameHistorySource.cloud,
      ),
    ),
    expect: () => [
      const GameDetailLoading(),
      GameDetailLoaded(detail: buildDetail(GameHistorySource.cloud)),
    ],
  );

  blocTest<GameDetailBloc, GameDetailState>(
    'emits failure when detail cannot be loaded',
    build: buildBloc,
    setUp: () {
      when(
        getGameDetail(gameId: 'missing', source: GameHistorySource.local),
      ).thenThrow(StateError('Game not found'));
    },
    act: (bloc) => bloc.add(
      const GameDetailStarted(
        gameId: 'missing',
        source: GameHistorySource.local,
      ),
    ),
    expect: () => [
      const GameDetailLoading(),
      const GameDetailFailure(message: 'Bad state: Game not found'),
    ],
  );
}
