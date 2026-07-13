import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/round/domain/usecases/repeat_round_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/repeat_round_cubit.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'repeat_round_cubit_test.mocks.dart';

@GenerateNiceMocks([MockSpec<RepeatRoundUseCase>()])
void main() {
  late MockRepeatRoundUseCase repeatRound;

  final resetRound = Round(
    id: 'round-2',
    gameId: 'game-1',
    roundNumber: 2,
    cardsInRound: 5,
    dealerPlayerId: 'p2',
    status: RoundStatus.bidding,
    bids: const {},
    createdAt: DateTime(2026),
  );

  setUp(() {
    repeatRound = MockRepeatRoundUseCase();
  });

  blocTest<RepeatRoundCubit, RepeatRoundState>(
    'emits success when repeat round succeeds',
    build: () => RepeatRoundCubit(repeatRound: repeatRound),
    act: (cubit) => cubit.repeat(gameId: 'game-1', roundNumber: 2),
    setUp: () {
      when(
        repeatRound(gameId: 'game-1', roundNumber: 2),
      ).thenAnswer((_) async => resetRound);
    },
    expect: () => [
      isA<RepeatRoundInProgress>(),
      isA<RepeatRoundSuccess>()
          .having((s) => s.gameId, 'gameId', 'game-1')
          .having((s) => s.roundNumber, 'roundNumber', 2),
    ],
  );

  blocTest<RepeatRoundCubit, RepeatRoundState>(
    'emits failure when repeat round throws',
    build: () => RepeatRoundCubit(repeatRound: repeatRound),
    act: (cubit) => cubit.repeat(gameId: 'game-1', roundNumber: 2),
    setUp: () {
      when(
        repeatRound(gameId: 'game-1', roundNumber: 2),
      ).thenThrow(StateError('Closed rounds cannot be repeated'));
    },
    expect: () => [
      isA<RepeatRoundInProgress>(),
      isA<RepeatRoundFailure>().having(
        (s) => s.message,
        'message',
        contains('Closed rounds cannot be repeated'),
      ),
    ],
  );
}
