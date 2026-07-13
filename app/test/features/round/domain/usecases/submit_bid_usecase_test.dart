import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_bid_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'submit_bid_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<RoundRepository>()])
void main() {
  late MockRoundRepository roundRepository;
  late SubmitBidUseCase useCase;

  const biddingOrder = ['p1', 'p2', 'p3', 'p0'];

  Round baseRound({Map<String, int> bids = const {}}) {
    return Round(
      id: 'round-1',
      gameId: 'game-1',
      roundNumber: 1,
      cardsInRound: 4,
      dealerPlayerId: 'p0',
      status: RoundStatus.bidding,
      bids: bids,
      createdAt: DateTime(2026),
    );
  }

  setUp(() {
    roundRepository = MockRoundRepository();
    useCase = SubmitBidUseCase(roundRepository);
  });

  test('persists bid and advances to next player', () async {
    final round = baseRound();
    when(roundRepository.updateRound(any)).thenAnswer(
      (invocation) async => invocation.positionalArguments[0] as Round,
    );

    final result = await useCase(
      round: round,
      biddingOrder: biddingOrder,
      currentPlayerId: 'p1',
      bid: 2,
    );

    expect(result.round.bids, {'p1': 2});
    expect(result.currentPlayerId, 'p2');
    verify(roundRepository.updateRound(any)).called(1);
  });

  test('blocks dealer from bidding forbidden value', () async {
    final round = baseRound(bids: const {'p1': 1, 'p2': 1, 'p3': 1});

    expect(
      () => useCase(
        round: round,
        biddingOrder: biddingOrder,
        currentPlayerId: 'p0',
        bid: 1,
      ),
      throwsStateError,
    );
    verifyNever(roundRepository.updateRound(any));
  });

  test('allows dealer to bid non-forbidden value', () async {
    final round = baseRound(bids: const {'p1': 1, 'p2': 1, 'p3': 1});
    when(roundRepository.updateRound(any)).thenAnswer(
      (invocation) async => invocation.positionalArguments[0] as Round,
    );

    final result = await useCase(
      round: round,
      biddingOrder: biddingOrder,
      currentPlayerId: 'p0',
      bid: 0,
    );

    expect(result.round.bids['p0'], 0);
    expect(result.currentPlayerId, isNull);
  });

  test('rejects bid out of range', () async {
    expect(
      () => useCase(
        round: baseRound(),
        biddingOrder: biddingOrder,
        currentPlayerId: 'p1',
        bid: 5,
      ),
      throwsArgumentError,
    );
  });

  test('rejects bid when it is not player turn', () async {
    expect(
      () => useCase(
        round: baseRound(),
        biddingOrder: biddingOrder,
        currentPlayerId: 'p2',
        bid: 1,
      ),
      throwsStateError,
    );
  });
}
