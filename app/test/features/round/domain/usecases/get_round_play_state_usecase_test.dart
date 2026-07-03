import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/usecases/get_round_play_state_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'get_round_play_state_usecase_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GameRepository>(),
  MockSpec<RoundRepository>(),
])
void main() {
  late MockGameRepository gameRepository;
  late MockRoundRepository roundRepository;
  late GetRoundPlayStateUseCase useCase;

  final players = [
    PlayerEmbed(
      id: 'p2',
      displayName: 'Carla',
      isGuest: true,
      userId: null,
      seatOrder: 2,
      totalScore: 15,
      joinedAt: DateTime(2026),
    ),
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
    playerCount: 3,
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
    bids: const {'p0': 0, 'p1': 2, 'p2': 1},
    createdAt: DateTime(2026),
  );

  setUp(() {
    gameRepository = MockGameRepository();
    roundRepository = MockRoundRepository();
    useCase = GetRoundPlayStateUseCase(gameRepository, roundRepository);
  });

  test('loads play state with players sorted by seatOrder', () async {
    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => game);
    when(
      roundRepository.getRoundByGameAndNumber('game-1', 1),
    ).thenAnswer((_) async => round);

    final state = await useCase(gameId: 'game-1', roundNumber: 1);

    expect(state.players.map((p) => p.id), ['p0', 'p1', 'p2']);
    expect(state.bidSum, 3);
    expect(state.restrictionMet, isTrue);
    expect(state.round.status, RoundStatus.playing);
  });

  test('restrictionMet is false when bid sum equals cardsInRound', () async {
    final invalidRound = round.copyWith(
      bids: const {'p0': 1, 'p1': 2, 'p2': 1},
    );

    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => game);
    when(
      roundRepository.getRoundByGameAndNumber('game-1', 1),
    ).thenAnswer((_) async => invalidRound);

    final state = await useCase(gameId: 'game-1', roundNumber: 1);

    expect(state.bidSum, 4);
    expect(state.restrictionMet, isFalse);
  });

  test('throws when game is not found', () async {
    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => null);

    expect(
      () => useCase(gameId: 'game-1', roundNumber: 1),
      throwsStateError,
    );
  });

  test('throws when round is not in playing status', () async {
    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => game);
    when(
      roundRepository.getRoundByGameAndNumber('game-1', 1),
    ).thenAnswer(
      (_) async => round.copyWith(status: RoundStatus.bidding),
    );

    expect(
      () => useCase(gameId: 'game-1', roundNumber: 1),
      throwsStateError,
    );
  });
}
