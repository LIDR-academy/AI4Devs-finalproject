import 'package:bloc_test/bloc_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/add_player_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/get_game_by_id_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/remove_player_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'add_players_bloc_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GetGameByIdUseCase>(),
  MockSpec<AddPlayerUseCase>(),
  MockSpec<RemovePlayerUseCase>(),
])
void main() {
  late MockGetGameByIdUseCase getGameById;
  late MockAddPlayerUseCase addPlayer;
  late MockRemovePlayerUseCase removePlayer;

  final baseGame = Game(
    id: 'game-1',
    status: GameStatus.setup,
    playerCount: 4,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [],
    players: const [],
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  setUp(() {
    getGameById = MockGetGameByIdUseCase();
    addPlayer = MockAddPlayerUseCase();
    removePlayer = MockRemovePlayerUseCase();
  });

  AddPlayersBloc buildBloc() => AddPlayersBloc(
        getGameById: getGameById,
        addPlayer: addPlayer,
        removePlayer: removePlayer,
      );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'loads game on start',
    build: buildBloc,
    setUp: () {
      when(getGameById('game-1')).thenAnswer((_) async => baseGame);
    },
    act: (bloc) => bloc.add(const AddPlayersStarted(gameId: 'game-1')),
    expect: () => [
      const AddPlayersLoading(),
      const AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [],
        isLoading: false,
      ),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'adds player and updates state',
    build: buildBloc,
    seed: () => const AddPlayersLoaded(
      gameId: 'game-1',
      playerCount: 4,
      players: [],
      isLoading: false,
    ),
    setUp: () {
      final player = PlayerEmbed(
        id: 'p1',
        displayName: 'Ana',
        isGuest: true,
        userId: null,
        seatOrder: 0,
        totalScore: 0,
        joinedAt: DateTime(2026),
      );
      when(addPlayer(gameId: 'game-1', name: 'Ana')).thenAnswer(
        (_) async => baseGame.copyWith(players: [player]),
      );
    },
    act: (bloc) => bloc.add(
      const PlayerAdded(name: 'Ana', type: PlayerAddType.guest),
    ),
    expect: () => [
      const AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [],
        isLoading: true,
      ),
      AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [
          PlayerEmbed(
            id: 'p1',
            displayName: 'Ana',
            isGuest: true,
            userId: null,
            seatOrder: 0,
            totalScore: 0,
            joinedAt: DateTime(2026),
          ),
        ],
        isLoading: false,
      ),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'isComplete only when all slots are filled',
    build: buildBloc,
    setUp: () {
      when(getGameById('game-1')).thenAnswer((_) async => baseGame);
    },
    act: (bloc) => bloc.add(const AddPlayersStarted(gameId: 'game-1')),
    verify: (bloc) {
      final state = bloc.state as AddPlayersLoaded;
      expect(state.isComplete, isFalse);
      expect(state.remainingCount, 4);
    },
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'navigates to setup only when roster is complete',
    build: buildBloc,
    seed: () {
      final players = List.generate(
        4,
        (index) => PlayerEmbed(
          id: 'p$index',
          displayName: 'Player $index',
          isGuest: true,
          userId: null,
          seatOrder: index,
          totalScore: 0,
          joinedAt: DateTime(2026),
        ),
      );
      return AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: players,
        isLoading: false,
      );
    },
    act: (bloc) => bloc.add(const ContinueRequested()),
    expect: () => [
      const AddPlayersNavigateToSetup(gameId: 'game-1'),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'does not navigate when roster is incomplete',
    build: buildBloc,
    seed: () => const AddPlayersLoaded(
      gameId: 'game-1',
      playerCount: 4,
      players: [],
      isLoading: false,
    ),
    act: (bloc) => bloc.add(const ContinueRequested()),
    expect: () => [],
  );
}
