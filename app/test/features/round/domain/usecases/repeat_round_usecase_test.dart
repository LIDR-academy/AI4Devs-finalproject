import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/usecases/repeat_round_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'repeat_round_usecase_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GameRepository>(),
  MockSpec<RoundRepository>(),
])
void main() {
  late MockGameRepository gameRepository;
  late MockRoundRepository roundRepository;
  late RepeatRoundUseCase useCase;

  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 30,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p2',
      displayName: 'Bob',
      isGuest: true,
      userId: null,
      seatOrder: 2,
      totalScore: 25,
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
    currentRoundNumber: 2,
    startedAt: DateTime(2026),
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  Round baseRound({RoundStatus status = RoundStatus.playing}) {
    return Round(
      id: 'round-2',
      gameId: 'game-1',
      roundNumber: 2,
      cardsInRound: 5,
      dealerPlayerId: 'p2',
      status: status,
      bids: const {'p1': 2, 'p2': 3},
      tricks: const {'p1': 2, 'p2': 3},
      scoresDelta: const {'p1': 10, 'p2': 15},
      createdAt: DateTime(2026),
      closedAt: status == RoundStatus.closed ? DateTime(2026) : null,
    );
  }

  setUp(() {
    gameRepository = MockGameRepository();
    roundRepository = MockRoundRepository();
    useCase = RepeatRoundUseCase(gameRepository, roundRepository);
    when(gameRepository.getGameById('game-1')).thenAnswer((_) async => game);
  });

  test('resets round to bidding and reverts totalScore', () async {
    final round = baseRound();

    when(
      roundRepository.getRoundByGameAndNumber('game-1', 2),
    ).thenAnswer((_) async => round);

    when(
      gameRepository.repeatRoundAndRevertScores(
        resetRound: anyNamed('resetRound'),
        updatedPlayers: anyNamed('updatedPlayers'),
      ),
    ).thenAnswer((invocation) async {
      return invocation.namedArguments[#resetRound] as Round;
    });

    final result = await useCase(gameId: 'game-1', roundNumber: 2);

    expect(result.status, RoundStatus.bidding);
    expect(result.bids, isEmpty);
    expect(result.tricks, isNull);
    expect(result.scoresDelta, isNull);
    expect(result.closedAt, isNull);
    expect(result.dealerPlayerId, 'p2');
    expect(result.cardsInRound, 5);

    final captured = verify(
      gameRepository.repeatRoundAndRevertScores(
        resetRound: captureAnyNamed('resetRound'),
        updatedPlayers: captureAnyNamed('updatedPlayers'),
      ),
    ).captured;

    final updatedPlayers = captured[1] as List<PlayerEmbed>;
    expect(updatedPlayers[0].totalScore, 20);
    expect(updatedPlayers[1].totalScore, 10);
  });

  test('resets round without changing totalScore when scoresDelta is null', () async {
    final round = Round(
      id: 'round-2',
      gameId: 'game-1',
      roundNumber: 2,
      cardsInRound: 5,
      dealerPlayerId: 'p2',
      status: RoundStatus.bidding,
      bids: const {'p1': 2, 'p2': 3},
      createdAt: DateTime(2026),
    );

    when(
      roundRepository.getRoundByGameAndNumber('game-1', 2),
    ).thenAnswer((_) async => round);

    when(
      gameRepository.repeatRoundAndRevertScores(
        resetRound: anyNamed('resetRound'),
        updatedPlayers: anyNamed('updatedPlayers'),
      ),
    ).thenAnswer((invocation) async {
      return invocation.namedArguments[#resetRound] as Round;
    });

    await useCase(gameId: 'game-1', roundNumber: 2);

    final captured = verify(
      gameRepository.repeatRoundAndRevertScores(
        resetRound: captureAnyNamed('resetRound'),
        updatedPlayers: captureAnyNamed('updatedPlayers'),
      ),
    ).captured;

    final updatedPlayers = captured[1] as List<PlayerEmbed>;
    expect(updatedPlayers[0].totalScore, 30);
    expect(updatedPlayers[1].totalScore, 25);
  });

  test('throws when round is closed', () async {
    final round = baseRound(status: RoundStatus.closed);

    when(
      roundRepository.getRoundByGameAndNumber('game-1', 2),
    ).thenAnswer((_) async => round);

    expect(
      () => useCase(gameId: 'game-1', roundNumber: 2),
      throwsA(isA<StateError>()),
    );
    verifyNever(
      gameRepository.repeatRoundAndRevertScores(
        resetRound: anyNamed('resetRound'),
        updatedPlayers: anyNamed('updatedPlayers'),
      ),
    );
  });

  test('throws when round is not the current round', () async {
    final round = baseRound();

    when(
      roundRepository.getRoundByGameAndNumber('game-1', 1),
    ).thenAnswer((_) async => round.copyWith(roundNumber: 1, id: 'round-1'));

    expect(
      () => useCase(gameId: 'game-1', roundNumber: 1),
      throwsA(isA<StateError>()),
    );
    verifyNever(
      gameRepository.repeatRoundAndRevertScores(
        resetRound: anyNamed('resetRound'),
        updatedPlayers: anyNamed('updatedPlayers'),
      ),
    );
  });

  test('only persists the specified round', () async {
    final round = baseRound();

    when(
      roundRepository.getRoundByGameAndNumber('game-1', 2),
    ).thenAnswer((_) async => round);

    when(
      gameRepository.repeatRoundAndRevertScores(
        resetRound: anyNamed('resetRound'),
        updatedPlayers: anyNamed('updatedPlayers'),
      ),
    ).thenAnswer((invocation) async {
      return invocation.namedArguments[#resetRound] as Round;
    });

    await useCase(gameId: 'game-1', roundNumber: 2);

    final captured = verify(
      gameRepository.repeatRoundAndRevertScores(
        resetRound: captureAnyNamed('resetRound'),
        updatedPlayers: captureAnyNamed('updatedPlayers'),
      ),
    ).captured;

    final resetRound = captured[0] as Round;
    expect(resetRound.id, 'round-2');
    expect(resetRound.roundNumber, 2);
  });
}
