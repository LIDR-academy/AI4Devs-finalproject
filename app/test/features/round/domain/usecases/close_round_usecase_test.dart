import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/round/domain/services/score_calculator_service.dart';
import 'package:la_pocha/features/round/domain/services/tricks_sum_validator.dart';
import 'package:la_pocha/features/round/domain/usecases/close_round_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_tricks_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'close_round_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GameRepository>()])
void main() {
  late MockGameRepository gameRepository;
  late CloseRoundUseCase useCase;

  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 0,
      totalScore: 10,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p2',
      displayName: 'Bob',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 5,
      joinedAt: DateTime(2026),
    ),
  ];

  Round baseRound({RoundStatus status = RoundStatus.playing}) {
    return Round(
      id: 'round-1',
      gameId: 'game-1',
      roundNumber: 1,
      cardsInRound: 4,
      dealerPlayerId: 'p1',
      status: status,
      bids: const {'p1': 2, 'p2': 2},
      createdAt: DateTime(2026),
    );
  }

  setUp(() {
    gameRepository = MockGameRepository();
    useCase = CloseRoundUseCase(
      gameRepository,
      SubmitTricksUseCase(
        const ScoreCalculatorService(),
        const TricksSumValidator(),
      ),
    );
  });

  test('closes round and updates player total scores', () async {
    final round = baseRound();
    const tricks = {'p1': 2, 'p2': 2};

    when(
      gameRepository.closeRoundAndUpdateScores(
        closedRound: anyNamed('closedRound'),
        updatedPlayers: anyNamed('updatedPlayers'),
      ),
    ).thenAnswer((invocation) async {
      return invocation.namedArguments[#closedRound] as Round;
    });

    final result = await useCase(
      gameId: 'game-1',
      round: round,
      players: players,
      tricks: tricks,
    );

    expect(result.status, RoundStatus.closed);
    expect(result.tricks, tricks);
    expect(result.scoresDelta, {'p1': 20, 'p2': 20});
    expect(result.closedAt, isNotNull);

    final captured = verify(
      gameRepository.closeRoundAndUpdateScores(
        closedRound: captureAnyNamed('closedRound'),
        updatedPlayers: captureAnyNamed('updatedPlayers'),
      ),
    ).captured;

    final updatedPlayers = captured[1] as List<PlayerEmbed>;
    expect(updatedPlayers[0].totalScore, 30);
    expect(updatedPlayers[1].totalScore, 25);
  });

  test('throws when tricks sum is invalid', () async {
    final round = baseRound();

    expect(
      () => useCase(
        gameId: 'game-1',
        round: round,
        players: players,
        tricks: const {'p1': 2, 'p2': 1},
      ),
      throwsStateError,
    );
    verifyNever(
      gameRepository.closeRoundAndUpdateScores(
        closedRound: anyNamed('closedRound'),
        updatedPlayers: anyNamed('updatedPlayers'),
      ),
    );
  });

  test('throws when round is not in playing status', () async {
    final round = baseRound(status: RoundStatus.bidding);

    expect(
      () => useCase(
        gameId: 'game-1',
        round: round,
        players: players,
        tricks: const {'p1': 2, 'p2': 2},
      ),
      throwsStateError,
    );
  });
}
