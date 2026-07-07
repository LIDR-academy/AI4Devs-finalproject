import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/usecases/correct_bids_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'correct_bids_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<RoundRepository>()])
void main() {
  late MockRoundRepository roundRepository;
  late CorrectBidsUseCase useCase;

  const playerIds = ['p1', 'p2', 'p3', 'p0'];

  Round baseRound({
    Map<String, int> bids = const {'p1': 1, 'p2': 1, 'p3': 1, 'p0': 0},
    RoundStatus status = RoundStatus.playing,
  }) {
    return Round(
      id: 'round-1',
      gameId: 'game-1',
      roundNumber: 1,
      cardsInRound: 4,
      dealerPlayerId: 'p0',
      status: status,
      bids: bids,
      createdAt: DateTime(2026),
    );
  }

  setUp(() {
    roundRepository = MockRoundRepository();
    useCase = CorrectBidsUseCase(roundRepository);
    when(roundRepository.updateRound(any)).thenAnswer(
      (invocation) async => invocation.positionalArguments[0] as Round,
    );
  });

  test('persists updated bids and returns the round', () async {
    final round = baseRound();
    const updatedBids = {'p1': 2, 'p2': 1, 'p3': 1, 'p0': 0};

    final result = await useCase(
      round: round,
      updatedBids: updatedBids,
      playerIds: playerIds,
    );

    expect(result.bids, updatedBids);
    final captured = verify(roundRepository.updateRound(captureAny))
        .captured
        .single as Round;
    expect(captured.bids, updatedBids);
  });

  test('allows a correction that breaks the dealer restriction', () async {
    final round = baseRound();
    const updatedBids = {'p1': 1, 'p2': 1, 'p3': 1, 'p0': 1};

    final result = await useCase(
      round: round,
      updatedBids: updatedBids,
      playerIds: playerIds,
    );

    expect(result.bids, updatedBids);
    verify(roundRepository.updateRound(any)).called(1);
  });

  test('throws ArgumentError when a bid is out of range', () async {
    final round = baseRound();
    const updatedBids = {'p1': 5, 'p2': 1, 'p3': 1, 'p0': 0};

    expect(
      () => useCase(
        round: round,
        updatedBids: updatedBids,
        playerIds: playerIds,
      ),
      throwsArgumentError,
    );
    verifyNever(roundRepository.updateRound(any));
  });

  test('throws ArgumentError when a bid is negative', () async {
    final round = baseRound();
    const updatedBids = {'p1': -1, 'p2': 1, 'p3': 1, 'p0': 0};

    expect(
      () => useCase(
        round: round,
        updatedBids: updatedBids,
        playerIds: playerIds,
      ),
      throwsArgumentError,
    );
    verifyNever(roundRepository.updateRound(any));
  });

  test('throws ArgumentError when a player is missing a bid', () async {
    final round = baseRound();
    const updatedBids = {'p1': 1, 'p2': 1, 'p3': 1};

    expect(
      () => useCase(
        round: round,
        updatedBids: updatedBids,
        playerIds: playerIds,
      ),
      throwsArgumentError,
    );
    verifyNever(roundRepository.updateRound(any));
  });

  test('throws StateError when round is not in playing status', () async {
    final round = baseRound(status: RoundStatus.closed);
    const updatedBids = {'p1': 2, 'p2': 1, 'p3': 1, 'p0': 0};

    expect(
      () => useCase(
        round: round,
        updatedBids: updatedBids,
        playerIds: playerIds,
      ),
      throwsStateError,
    );
    verifyNever(roundRepository.updateRound(any));
  });
}
