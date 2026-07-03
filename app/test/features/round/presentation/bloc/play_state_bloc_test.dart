import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/round/domain/entities/round_play_state.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_bloc.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/play_state_state.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'play_state_bloc_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GetRoundPlayStateUseCase>()])
void main() {
  late MockGetRoundPlayStateUseCase getRoundPlayState;

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

  PlayStateBloc buildBloc() {
    return PlayStateBloc(getRoundPlayState: getRoundPlayState);
  }

  setUp(() {
    getRoundPlayState = MockGetRoundPlayStateUseCase();
  });

  blocTest<PlayStateBloc, PlayStateBlocState>(
    'loads play state when round is playing',
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
      const PlayStateStarted(gameId: 'game-1', roundNumber: 1),
    ),
    expect: () => [
      const PlayStateLoading(),
      isA<PlayStateLoaded>()
          .having((s) => s.playState.bidSum, 'bidSum', 2)
          .having((s) => s.playState.restrictionMet, 'restrictionMet', true)
          .having(
            (s) => s.playState.players.map((p) => p.displayName),
            'playerNames',
            ['Dealer', 'Ana'],
          ),
    ],
  );

  blocTest<PlayStateBloc, PlayStateBlocState>(
    'emits failure when loading fails',
    build: buildBloc,
    setUp: () {
      when(
        getRoundPlayState(
          gameId: anyNamed('gameId'),
          roundNumber: anyNamed('roundNumber'),
        ),
      ).thenThrow(StateError('Round is not in playing status'));
    },
    act: (bloc) => bloc.add(
      const PlayStateStarted(gameId: 'game-1', roundNumber: 1),
    ),
    expect: () => [
      const PlayStateLoading(),
      isA<PlayStateFailure>().having(
        (s) => s.message,
        'message',
        contains('playing status'),
      ),
    ],
  );

  blocTest<PlayStateBloc, PlayStateBlocState>(
    'navigates to tricks when introduce tricks is requested',
    build: buildBloc,
    seed: () => PlayStateLoaded(playState: playState),
    act: (bloc) => bloc.add(const IntroduceTricksRequested()),
    expect: () => [
      isA<PlayStateNavigateToTricks>()
          .having((s) => s.gameId, 'gameId', 'game-1')
          .having((s) => s.roundNumber, 'roundNumber', 1),
    ],
  );
}
