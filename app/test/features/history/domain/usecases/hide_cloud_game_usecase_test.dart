import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/history/data/datasources/history_firestore_datasource.dart';
import 'package:la_pocha/features/history/domain/repositories/history_repository.dart';
import 'package:la_pocha/features/history/domain/usecases/hide_cloud_game_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'hide_cloud_game_usecase_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<HistoryRepository>(),
  MockSpec<GameRepository>(),
  MockSpec<HistoryFirestoreDatasource>(),
])
void main() {
  late MockHistoryRepository historyRepository;
  late MockGameRepository gameRepository;
  late MockHistoryFirestoreDatasource firestoreDatasource;
  late HideCloudGameUseCase useCase;

  setUp(() {
    historyRepository = MockHistoryRepository();
    gameRepository = MockGameRepository();
    firestoreDatasource = MockHistoryFirestoreDatasource();
    useCase = HideCloudGameUseCase(historyRepository);
  });

  test('hides cloud game in local storage only', () async {
    when(historyRepository.hideCloudGame('cloud-1'))
        .thenAnswer((_) async {});

    await useCase(gameId: 'cloud-1');

    verify(historyRepository.hideCloudGame('cloud-1')).called(1);
    verifyNever(gameRepository.deleteGame(any));
    verifyNever(firestoreDatasource.getFinishedCloudGames());
  });
}
