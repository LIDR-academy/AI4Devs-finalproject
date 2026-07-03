import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/usecases/load_bidding_context_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'load_bidding_context_usecase_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GameRepository>(),
  MockSpec<RoundRepository>(),
])
void main() {
  late MockGameRepository gameRepository;
  late MockRoundRepository roundRepository;
  late LoadBiddingContextUseCase useCase;

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
    status: RoundStatus.bidding,
    bids: const {},
    createdAt: DateTime(2026),
  );

  setUp(() {
    gameRepository = MockGameRepository();
    roundRepository = MockRoundRepository();
    useCase = LoadBiddingContextUseCase(gameRepository, roundRepository);
  });

  test('loads bidding context with correct order starting after dealer', () async {
    final gameWithDealer = game.copyWith(
      players: [
        PlayerEmbed(
          id: 'p0',
          displayName: 'Dealer',
          isGuest: true,
          userId: null,
          seatOrder: 0,
          totalScore: 0,
          joinedAt: DateTime(2026),
        ),
        ...players,
      ],
    );
    final roundWithDealer = round.copyWith(dealerPlayerId: 'p0');

    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => gameWithDealer);
    when(
      roundRepository.getRoundByGameAndNumber('game-1', 1),
    ).thenAnswer((_) async => roundWithDealer);

    final context = await useCase(gameId: 'game-1', roundNumber: 1);

    expect(context.biddingOrder, ['p1', 'p2', 'p3', 'p0']);
    expect(context.currentPlayerId, 'p1');
  });

  test('current player is null when all bids are submitted', () async {
    final gameWithDealer = game.copyWith(
      players: [
        PlayerEmbed(
          id: 'p0',
          displayName: 'Dealer',
          isGuest: true,
          userId: null,
          seatOrder: 0,
          totalScore: 0,
          joinedAt: DateTime(2026),
        ),
        ...players,
      ],
    );
    final completedRound = round.copyWith(
      dealerPlayerId: 'p0',
      bids: const {'p1': 1, 'p2': 1, 'p3': 1, 'p0': 0},
    );

    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => gameWithDealer);
    when(
      roundRepository.getRoundByGameAndNumber('game-1', 1),
    ).thenAnswer((_) async => completedRound);

    final context = await useCase(gameId: 'game-1', roundNumber: 1);

    expect(context.currentPlayerId, isNull);
  });

  test('throws when round is not in bidding status', () async {
    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => game);
    when(
      roundRepository.getRoundByGameAndNumber('game-1', 1),
    ).thenAnswer(
      (_) async => round.copyWith(status: RoundStatus.playing),
    );

    expect(
      () => useCase(gameId: 'game-1', roundNumber: 1),
      throwsStateError,
    );
  });
}
