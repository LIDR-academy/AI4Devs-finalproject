import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/start_game_result.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/start_game_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'start_game_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GameRepository>()])
void main() {
  late MockGameRepository repository;
  late StartGameUseCase useCase;

  final roundSequence = [
    const RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
    const RoundDefinition(roundNumber: 2, cardsPerPlayer: 5),
  ];

  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p2',
      displayName: 'Bob',
      isGuest: true,
      userId: null,
      seatOrder: 2,
      totalScore: 0,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p3',
      displayName: 'Carla',
      isGuest: true,
      userId: null,
      seatOrder: 3,
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
    roundSequence: roundSequence,
    players: players,
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  setUp(() {
    repository = MockGameRepository();
    useCase = StartGameUseCase(repository);
  });

  test('creates round 1 and updates status to in_progress', () async {
    when(
      repository.startGame(
        gameId: anyNamed('gameId'),
        players: anyNamed('players'),
        firstDealerPlayerId: anyNamed('firstDealerPlayerId'),
        firstRound: anyNamed('firstRound'),
      ),
    ).thenAnswer(
      (_) async => const StartGameResult(
        gameId: 'game-1',
        roundId: 'round-1',
        roundNumber: 1,
      ),
    );

    final result = await useCase(
      game: baseGame,
      players: players,
      firstDealerPlayerId: 'p1',
    );

    expect(result.roundId, 'round-1');
    expect(result.roundNumber, 1);

    final captured = verify(
      repository.startGame(
        gameId: captureAnyNamed('gameId'),
        players: captureAnyNamed('players'),
        firstDealerPlayerId: captureAnyNamed('firstDealerPlayerId'),
        firstRound: captureAnyNamed('firstRound'),
      ),
    ).captured;

    expect(captured[0], 'game-1');
    expect(captured[1], players);
    expect(captured[2], 'p1');

    final round = captured[3];
    expect(round.roundNumber, 1);
    expect(round.cardsInRound, 4);
    expect(round.dealerPlayerId, 'p1');
    expect(round.status, RoundStatus.bidding);
    expect(round.bids, isEmpty);
  });

  test('fails when player count does not match roster size', () async {
    await expectLater(
      useCase(
        game: baseGame,
        players: players.take(2).toList(),
        firstDealerPlayerId: 'p1',
      ),
      throwsA(isA<ArgumentError>()),
    );

    verifyNever(
      repository.startGame(
        gameId: anyNamed('gameId'),
        players: anyNamed('players'),
        firstDealerPlayerId: anyNamed('firstDealerPlayerId'),
        firstRound: anyNamed('firstRound'),
      ),
    );
  });
}
