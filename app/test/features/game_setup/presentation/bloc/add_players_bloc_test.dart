import 'package:bloc_test/bloc_test.dart';
import 'package:la_pocha/features/favorites/domain/entities/favorite_player.dart';
import 'package:la_pocha/features/favorites/domain/usecases/add_favorite_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/get_favorites_usecase.dart';
import 'package:la_pocha/features/favorites/domain/usecases/remove_favorite_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/add_player_from_favorite_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/add_player_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/get_game_by_id_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/remove_player_usecase.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/update_player_name_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/add_players_bloc.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'add_players_bloc_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GetGameByIdUseCase>(),
  MockSpec<GetFavoritesUseCase>(),
  MockSpec<AddPlayerUseCase>(),
  MockSpec<AddPlayerFromFavoriteUseCase>(),
  MockSpec<RemovePlayerUseCase>(),
  MockSpec<UpdatePlayerNameUseCase>(),
  MockSpec<AddFavoriteUseCase>(),
  MockSpec<RemoveFavoriteUseCase>(),
])
void main() {
  late MockGetGameByIdUseCase getGameById;
  late MockGetFavoritesUseCase getFavorites;
  late MockAddPlayerUseCase addPlayer;
  late MockAddPlayerFromFavoriteUseCase addPlayerFromFavorite;
  late MockRemovePlayerUseCase removePlayer;
  late MockUpdatePlayerNameUseCase updatePlayerName;
  late MockAddFavoriteUseCase addFavorite;
  late MockRemoveFavoriteUseCase removeFavorite;

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
    getFavorites = MockGetFavoritesUseCase();
    addPlayer = MockAddPlayerUseCase();
    addPlayerFromFavorite = MockAddPlayerFromFavoriteUseCase();
    removePlayer = MockRemovePlayerUseCase();
    updatePlayerName = MockUpdatePlayerNameUseCase();
    addFavorite = MockAddFavoriteUseCase();
    removeFavorite = MockRemoveFavoriteUseCase();
  });

  AddPlayersBloc buildBloc() => AddPlayersBloc(
        getGameById: getGameById,
        getFavorites: getFavorites,
        addPlayer: addPlayer,
        addPlayerFromFavorite: addPlayerFromFavorite,
        removePlayer: removePlayer,
        updatePlayerName: updatePlayerName,
        addFavorite: addFavorite,
        removeFavorite: removeFavorite,
      );

  final favoriteAna = FavoritePlayer(
    id: 'fav-ana',
    displayName: 'Ana',
    userId: null,
    createdAt: DateTime(2026),
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'loads game and favorites on start',
    build: buildBloc,
    setUp: () {
      when(getGameById('game-1')).thenAnswer((_) async => baseGame);
      when(getFavorites()).thenAnswer((_) async => [favoriteAna]);
    },
    act: (bloc) => bloc.add(const AddPlayersStarted(gameId: 'game-1')),
    expect: () => [
      const AddPlayersLoading(),
      AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [],
        favorites: [favoriteAna],
        activeEditIndex: null,
        isLoading: false,
      ),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'adds player from favorite chip and updates players',
    build: buildBloc,
    seed: () => AddPlayersLoaded(
      gameId: 'game-1',
      playerCount: 4,
      players: [],
      favorites: [favoriteAna],
      activeEditIndex: null,
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
      when(
        addPlayerFromFavorite(gameId: 'game-1', favoriteId: 'fav-ana'),
      ).thenAnswer((_) async => baseGame.copyWith(players: [player]));
    },
    act: (bloc) => bloc.add(
      FavoriteChipTapped(favorite: favoriteAna),
    ),
    expect: () => [
      AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [],
        favorites: [favoriteAna],
        activeEditIndex: null,
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
        favorites: [favoriteAna],
        activeEditIndex: null,
        isLoading: false,
      ),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'toggles player favorite on and off',
    build: buildBloc,
    seed: () => AddPlayersLoaded(
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
      favorites: const [],
      activeEditIndex: null,
      isLoading: false,
    ),
    setUp: () {
      when(addFavorite(displayName: 'Ana', userId: null)).thenAnswer(
        (_) async => favoriteAna,
      );
      when(removeFavorite('fav-ana')).thenAnswer((_) async {});
    },
    act: (bloc) async {
      bloc.add(const PlayerFavoriteToggled(playerId: 'p1'));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const PlayerFavoriteToggled(playerId: 'p1'));
    },
    expect: () => [
      isA<AddPlayersLoaded>().having((s) => s.isLoading, 'loading', true),
      isA<AddPlayersLoaded>()
          .having((s) => s.favorites.length, 'favorites', 1)
          .having((s) => s.isLoading, 'loading', false),
      isA<AddPlayersLoaded>().having((s) => s.isLoading, 'loading', true),
      isA<AddPlayersLoaded>()
          .having((s) => s.favorites.isEmpty, 'favorites', true)
          .having((s) => s.isLoading, 'loading', false),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'removes player and keeps favorite to re-show chip',
    build: buildBloc,
    seed: () => AddPlayersLoaded(
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
      favorites: [favoriteAna],
      activeEditIndex: null,
      isLoading: false,
    ),
    setUp: () {
      when(removePlayer(gameId: 'game-1', playerId: 'p1')).thenAnswer(
        (_) async => baseGame.copyWith(players: const []),
      );
    },
    act: (bloc) => bloc.add(const PlayerRemoved(playerId: 'p1')),
    expect: () => [
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
        favorites: [favoriteAna],
        activeEditIndex: null,
        isLoading: true,
      ),
      AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [],
        favorites: [favoriteAna],
        activeEditIndex: null,
        isLoading: false,
      ),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'activates and cancels inline edit slot',
    build: buildBloc,
    seed: () => const AddPlayersLoaded(
      gameId: 'game-1',
      playerCount: 4,
      players: [],
      favorites: [],
      activeEditIndex: null,
      isLoading: false,
    ),
    act: (bloc) async {
      bloc.add(const EditSlotActivated(index: 0));
      await Future<void>.delayed(Duration.zero);
      bloc.add(const EditSlotCancelled());
    },
    expect: () => [
      const AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [],
        favorites: [],
        activeEditIndex: 0,
        isLoading: false,
      ),
      const AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [],
        favorites: [],
        activeEditIndex: null,
        isLoading: false,
      ),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'confirms player name from inline edit',
    build: buildBloc,
    seed: () => const AddPlayersLoaded(
      gameId: 'game-1',
      playerCount: 4,
      players: [],
      favorites: [],
      activeEditIndex: 0,
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
    act: (bloc) => bloc.add(const PlayerNameConfirmed(index: 0, name: 'Ana')),
    expect: () => [
      const AddPlayersLoaded(
        gameId: 'game-1',
        playerCount: 4,
        players: [],
        favorites: [],
        activeEditIndex: 0,
        isLoading: true,
      ),
      isA<AddPlayersLoaded>()
          .having((s) => s.players.length, 'players', 1)
          .having((s) => s.activeEditIndex, 'activeEditIndex', null)
          .having((s) => s.isLoading, 'isLoading', false),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'activates inline edit for existing player',
    build: buildBloc,
    seed: () => AddPlayersLoaded(
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
      favorites: const [],
      activeEditIndex: null,
      isLoading: false,
    ),
    act: (bloc) => bloc.add(const PlayerEditActivated(playerId: 'p1')),
    expect: () => [
      isA<AddPlayersLoaded>().having((s) => s.activeEditIndex, 'activeEditIndex', 0),
    ],
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'exits edit without update when name is unchanged',
    build: buildBloc,
    seed: () => AddPlayersLoaded(
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
      favorites: const [],
      activeEditIndex: 0,
      isLoading: false,
    ),
    act: (bloc) =>
        bloc.add(const PlayerNameUpdated(playerId: 'p1', newName: ' Ana ')),
    expect: () => [
      isA<AddPlayersLoaded>()
          .having((s) => s.activeEditIndex, 'activeEditIndex', null)
          .having((s) => s.players.first.displayName, 'name', 'Ana'),
    ],
    verify: (_) {
      verifyNever(
        updatePlayerName(
          gameId: anyNamed('gameId'),
          playerId: anyNamed('playerId'),
          newName: anyNamed('newName'),
        ),
      );
    },
  );

  blocTest<AddPlayersBloc, AddPlayersState>(
    'updates existing player name from inline edit',
    build: buildBloc,
    seed: () => AddPlayersLoaded(
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
      favorites: const [],
      activeEditIndex: 0,
      isLoading: false,
    ),
    setUp: () {
      final updated = PlayerEmbed(
        id: 'p1',
        displayName: 'Anita',
        isGuest: true,
        userId: null,
        seatOrder: 0,
        totalScore: 0,
        joinedAt: DateTime(2026),
      );
      when(
        updatePlayerName(gameId: 'game-1', playerId: 'p1', newName: 'Anita'),
      ).thenAnswer((_) async => baseGame.copyWith(players: [updated]));
    },
    act: (bloc) =>
        bloc.add(const PlayerNameUpdated(playerId: 'p1', newName: 'Anita')),
    expect: () => [
      isA<AddPlayersLoaded>().having((s) => s.isLoading, 'loading', true),
      isA<AddPlayersLoaded>()
          .having((s) => s.players.first.displayName, 'name', 'Anita')
          .having((s) => s.activeEditIndex, 'activeEditIndex', null)
          .having((s) => s.isLoading, 'isLoading', false),
    ],
  );
}
