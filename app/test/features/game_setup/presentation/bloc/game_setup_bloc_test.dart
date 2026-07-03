import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/start_game_result.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/get_game_by_id_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/randomize_first_dealer_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/reorder_players_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/set_first_dealer_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/start_game_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/game_setup_bloc.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'game_setup_bloc_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GetGameByIdUseCase>(),
  MockSpec<ReorderPlayersUseCase>(),
  MockSpec<SetFirstDealerUseCase>(),
  MockSpec<RandomizeFirstDealerUseCase>(),
  MockSpec<StartGameUseCase>(),
])
void main() {
  late MockGetGameByIdUseCase getGameById;
  late MockReorderPlayersUseCase reorderPlayers;
  late MockSetFirstDealerUseCase setFirstDealer;
  late MockRandomizeFirstDealerUseCase randomizeFirstDealer;
  late MockStartGameUseCase startGame;

  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 0,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p2',
      displayName: 'Bob',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p3',
      displayName: 'Carla',
      isGuest: true,
      userId: null,
      seatOrder: 2,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
  ];

  final baseGame = Game(
    id: 'game-1',
    status: GameStatus.setup,
    playerCount: 3,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [
      RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
    ],
    players: players,
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  setUp(() {
    getGameById = MockGetGameByIdUseCase();
    reorderPlayers = MockReorderPlayersUseCase();
    setFirstDealer = MockSetFirstDealerUseCase();
    randomizeFirstDealer = MockRandomizeFirstDealerUseCase();
    startGame = MockStartGameUseCase();
  });

  GameSetupBloc buildBloc() => GameSetupBloc(
        getGameById: getGameById,
        reorderPlayers: reorderPlayers,
        setFirstDealer: setFirstDealer,
        randomizeFirstDealer: randomizeFirstDealer,
        startGame: startGame,
      );

  blocTest<GameSetupBloc, GameSetupState>(
    'loads game and normalizes seat order to 1-based',
    build: buildBloc,
    setUp: () {
      when(getGameById('game-1')).thenAnswer((_) async => baseGame);
    },
    act: (bloc) => bloc.add(const GameSetupStarted(gameId: 'game-1')),
    expect: () => [
      const GameSetupLoading(),
      isA<GameSetupLoaded>()
          .having((s) => s.players.map((p) => p.seatOrder).toList(), 'seatOrder', [1, 2, 3])
          .having((s) => s.firstDealerPlayerId, 'firstDealer', 'p1'),
    ],
  );

  blocTest<GameSetupBloc, GameSetupState>(
    'reorder updates seatOrder via use case',
    build: buildBloc,
    seed: () => GameSetupLoaded(
      gameId: 'game-1',
      game: baseGame,
      players: [
        players[0].copyWith(seatOrder: 1),
        players[1].copyWith(seatOrder: 2),
        players[2].copyWith(seatOrder: 3),
      ],
      firstDealerPlayerId: 'p1',
      isStarting: false,
    ),
    setUp: () {
      when(
        reorderPlayers(
          players: anyNamed('players'),
          oldIndex: 0,
          newIndex: 2,
        ),
      ).thenReturn([
        players[1].copyWith(seatOrder: 1),
        players[2].copyWith(seatOrder: 2),
        players[0].copyWith(seatOrder: 3),
      ]);
    },
    act: (bloc) => bloc.add(
      const PlayersReordered(oldIndex: 0, newIndex: 2),
    ),
    expect: () => [
      isA<GameSetupLoaded>().having(
        (s) => s.players.map((p) => p.id).toList(),
        'player order',
        ['p2', 'p3', 'p1'],
      ),
    ],
  );

  blocTest<GameSetupBloc, GameSetupState>(
    'random dealer changes firstDealerPlayerId',
    build: buildBloc,
    seed: () => GameSetupLoaded(
      gameId: 'game-1',
      game: baseGame,
      players: [
        players[0].copyWith(seatOrder: 1),
        players[1].copyWith(seatOrder: 2),
        players[2].copyWith(seatOrder: 3),
      ],
      firstDealerPlayerId: 'p1',
      isStarting: false,
    ),
    setUp: () {
      when(randomizeFirstDealer(players: anyNamed('players'))).thenReturn('p3');
    },
    act: (bloc) => bloc.add(const RandomDealerRequested()),
    expect: () => [
      isA<GameSetupLoaded>().having(
        (s) => s.firstDealerPlayerId,
        'dealer',
        'p3',
      ),
    ],
  );

  blocTest<GameSetupBloc, GameSetupState>(
    'start game emits navigate with roundId',
    build: buildBloc,
    seed: () => GameSetupLoaded(
      gameId: 'game-1',
      game: baseGame,
      players: [
        players[0].copyWith(seatOrder: 1),
        players[1].copyWith(seatOrder: 2),
        players[2].copyWith(seatOrder: 3),
      ],
      firstDealerPlayerId: 'p1',
      isStarting: false,
    ),
    setUp: () {
      when(
        startGame(
          game: anyNamed('game'),
          players: anyNamed('players'),
          firstDealerPlayerId: anyNamed('firstDealerPlayerId'),
        ),
      ).thenAnswer(
        (_) async => const StartGameResult(
          gameId: 'game-1',
          roundId: 'round-1',
          roundNumber: 1,
        ),
      );
    },
    act: (bloc) => bloc.add(const StartGameRequested()),
    expect: () => [
      isA<GameSetupLoaded>().having((s) => s.isStarting, 'isStarting', true),
      isA<GameSetupNavigateToBids>()
          .having((s) => s.roundId, 'roundId', 'round-1')
          .having((s) => s.roundNumber, 'roundNumber', 1),
    ],
  );
}
