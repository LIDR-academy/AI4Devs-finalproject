import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/usecases/close_bidding_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'close_bidding_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<RoundRepository>()])
void main() {
  late MockRoundRepository roundRepository;
  late CloseBiddingUseCase useCase;

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

  const playerIds = ['p1', 'p2', 'p3', 'p0'];

  setUp(() {
    roundRepository = MockRoundRepository();
    useCase = CloseBiddingUseCase(roundRepository);
  });

  test('transitions round to playing when bids are valid', () async {
    final round = baseRound(
      bids: const {'p1': 1, 'p2': 1, 'p3': 1, 'p0': 0},
    );
    when(roundRepository.updateRound(any)).thenAnswer(
      (invocation) async => invocation.positionalArguments[0] as Round,
    );

    final result = await useCase(round: round, playerIds: playerIds);

    expect(result.status, RoundStatus.playing);
    verify(roundRepository.updateRound(any)).called(1);
  });

  test('throws when sum equals cardsInRound', () async {
    final round = baseRound(
      bids: const {'p1': 1, 'p2': 1, 'p3': 1, 'p0': 1},
    );

    expect(
      () => useCase(round: round, playerIds: playerIds),
      throwsStateError,
    );
    verifyNever(roundRepository.updateRound(any));
  });

  test('throws when not all players have bid', () async {
    final round = baseRound(bids: const {'p1': 1, 'p2': 1});

    expect(
      () => useCase(round: round, playerIds: playerIds),
      throwsStateError,
    );
  });
}
