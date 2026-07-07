import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/cancel_game_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/cancel_game_cubit.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'cancel_game_cubit_test.mocks.dart';

@GenerateNiceMocks([MockSpec<CancelGameUseCase>()])
void main() {
  late MockCancelGameUseCase cancelGame;

  setUp(() {
    cancelGame = MockCancelGameUseCase();
  });

  blocTest<CancelGameCubit, CancelGameState>(
    'emits [InProgress, Success] when cancellation succeeds',
    build: () => CancelGameCubit(cancelGame: cancelGame),
    setUp: () {
      when(cancelGame(gameId: 'game-1')).thenAnswer((_) async {});
    },
    act: (cubit) => cubit.cancel('game-1'),
    expect: () => [
      isA<CancelGameInProgress>(),
      isA<CancelGameSuccess>(),
    ],
    verify: (_) {
      verify(cancelGame(gameId: 'game-1')).called(1);
    },
  );

  blocTest<CancelGameCubit, CancelGameState>(
    'emits [InProgress, Failure] when cancellation throws',
    build: () => CancelGameCubit(cancelGame: cancelGame),
    setUp: () {
      when(cancelGame(gameId: 'game-1'))
          .thenThrow(StateError('boom'));
    },
    act: (cubit) => cubit.cancel('game-1'),
    expect: () => [
      isA<CancelGameInProgress>(),
      isA<CancelGameFailure>(),
    ],
  );
}
