import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/usecases/delete_local_game_usecase.dart';
import 'package:la_pocha/features/history/domain/usecases/hide_cloud_game_usecase.dart';
import 'package:la_pocha/features/history/presentation/bloc/delete_game_from_history_cubit.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'delete_game_from_history_cubit_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<DeleteLocalGameUseCase>(),
  MockSpec<HideCloudGameUseCase>(),
])
void main() {
  late MockDeleteLocalGameUseCase deleteLocalGame;
  late MockHideCloudGameUseCase hideCloudGame;

  setUp(() {
    deleteLocalGame = MockDeleteLocalGameUseCase();
    hideCloudGame = MockHideCloudGameUseCase();
  });

  DeleteGameFromHistoryCubit buildCubit() => DeleteGameFromHistoryCubit(
        deleteLocalGame: deleteLocalGame,
        hideCloudGame: hideCloudGame,
      );

  blocTest<DeleteGameFromHistoryCubit, DeleteGameFromHistoryState>(
    'routes local games to delete local use case',
    build: buildCubit,
    setUp: () {
      when(deleteLocalGame(gameId: 'local-1')).thenAnswer((_) async {});
    },
    act: (cubit) => cubit.delete(
      gameId: 'local-1',
      source: GameHistorySource.local,
    ),
    expect: () => [
      isA<DeleteGameFromHistoryInProgress>(),
      isA<DeleteGameFromHistorySuccess>(),
    ],
    verify: (_) {
      verify(deleteLocalGame(gameId: 'local-1')).called(1);
      verifyNever(hideCloudGame(gameId: anyNamed('gameId')));
    },
  );

  blocTest<DeleteGameFromHistoryCubit, DeleteGameFromHistoryState>(
    'routes cloud games to hide cloud use case',
    build: buildCubit,
    setUp: () {
      when(hideCloudGame(gameId: 'cloud-1')).thenAnswer((_) async {});
    },
    act: (cubit) => cubit.delete(
      gameId: 'cloud-1',
      source: GameHistorySource.cloud,
    ),
    expect: () => [
      isA<DeleteGameFromHistoryInProgress>(),
      isA<DeleteGameFromHistorySuccess>(),
    ],
    verify: (_) {
      verify(hideCloudGame(gameId: 'cloud-1')).called(1);
      verifyNever(deleteLocalGame(gameId: anyNamed('gameId')));
    },
  );

  blocTest<DeleteGameFromHistoryCubit, DeleteGameFromHistoryState>(
    'emits failure when delete throws',
    build: buildCubit,
    setUp: () {
      when(deleteLocalGame(gameId: 'local-1'))
          .thenThrow(StateError('boom'));
    },
    act: (cubit) => cubit.delete(
      gameId: 'local-1',
      source: GameHistorySource.local,
    ),
    expect: () => [
      isA<DeleteGameFromHistoryInProgress>(),
      isA<DeleteGameFromHistoryFailure>(),
    ],
  );
}
