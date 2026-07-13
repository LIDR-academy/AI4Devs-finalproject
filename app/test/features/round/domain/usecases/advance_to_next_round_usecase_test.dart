import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/services/dealer_rotation_service.dart';
import 'package:la_pocha/features/round/domain/usecases/advance_to_next_round_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'advance_to_next_round_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GameRepository>()])
void main() {
  late MockGameRepository gameRepository;
  late AdvanceToNextRoundUseCase useCase;

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
    PlayerEmbed(
      id: 'p2',
      displayName: 'Bob',
      isGuest: true,
      userId: null,
      seatOrder: 2,
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
    bids: const {'p1': 2, 'p2': 2},
    tricks: const {'p1': 2, 'p2': 2},
    scoresDelta: const {'p1': 10, 'p2': 10},
    createdAt: DateTime(2026),
    closedAt: DateTime(2026),
  );

  setUp(() {
    gameRepository = MockGameRepository();
    useCase = AdvanceToNextRoundUseCase(
      gameRepository,
      const DealerRotationService(),
    );
    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => game);
  });

  test('creates next round with rotated dealer', () async {
    when(
      gameRepository.advanceToNextRound(
        nextRound: anyNamed('nextRound'),
        nextRoundNumber: anyNamed('nextRoundNumber'),
      ),
    ).thenAnswer((invocation) async {
      final nextRound =
          invocation.namedArguments[#nextRound] as Round;
      return nextRound.copyWith(id: 'round-2');
    });

    final result = await useCase(
      gameId: 'game-1',
      closedRound: closedRound,
    );

    expect(result.roundNumber, 2);
    expect(result.dealerPlayerId, 'p2');
    expect(result.cardsInRound, 5);
    expect(result.status, RoundStatus.bidding);

    final captured = verify(
      gameRepository.advanceToNextRound(
        nextRound: captureAnyNamed('nextRound'),
        nextRoundNumber: captureAnyNamed('nextRoundNumber'),
      ),
    ).captured;

    final nextRound = captured[0] as Round;
    expect(nextRound.dealerPlayerId, 'p2');
    expect(captured[1], 2);
  });

  test('throws when trying to advance beyond last round', () async {
    final lastClosedRound = closedRound.copyWith(roundNumber: 2);

    expect(
      () => useCase(gameId: 'game-1', closedRound: lastClosedRound),
      throwsA(isA<StateError>()),
    );
  });
}
