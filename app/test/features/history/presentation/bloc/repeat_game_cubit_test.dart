import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/usecases/repeat_game_usecase.dart';
import 'package:la_pocha/features/history/presentation/bloc/repeat_game_cubit.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'repeat_game_cubit_test.mocks.dart';

@GenerateNiceMocks([MockSpec<RepeatGameUseCase>()])
void main() {
  late MockRepeatGameUseCase repeatGame;

  setUp(() {
    repeatGame = MockRepeatGameUseCase();
  });

  RepeatGameCubit buildCubit() => RepeatGameCubit(repeatGame: repeatGame);

  blocTest<RepeatGameCubit, RepeatGameState>(
    'emits success with new game id',
    build: buildCubit,
    setUp: () {
      when(
        repeatGame(
          sourceGameId: 'game-1',
          source: GameHistorySource.local,
        ),
      ).thenAnswer((_) async => 'new-game');
    },
    act: (cubit) => cubit.repeat(
      gameId: 'game-1',
      source: GameHistorySource.local,
    ),
    expect: () => [
      isA<RepeatGameInProgress>(),
      isA<RepeatGameSuccess>().having(
        (state) => state.newGameId,
        'newGameId',
        'new-game',
      ),
    ],
    verify: (_) {
      verify(
        repeatGame(
          sourceGameId: 'game-1',
          source: GameHistorySource.local,
        ),
      ).called(1);
    },
  );

  blocTest<RepeatGameCubit, RepeatGameState>(
    'emits failure when repeat throws',
    build: buildCubit,
    setUp: () {
      when(
        repeatGame(
          sourceGameId: 'game-1',
          source: GameHistorySource.cloud,
        ),
      ).thenThrow(StateError('network'));
    },
    act: (cubit) => cubit.repeat(
      gameId: 'game-1',
      source: GameHistorySource.cloud,
    ),
    expect: () => [
      isA<RepeatGameInProgress>(),
      isA<RepeatGameFailure>(),
    ],
  );
}
