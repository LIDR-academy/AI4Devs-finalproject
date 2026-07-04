import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/history/data/datasources/history_firestore_datasource.dart';
import 'package:la_pocha/features/history/data/datasources/history_local_datasource.dart';
import 'package:la_pocha/features/history/data/repositories/history_repository_impl.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'history_repository_impl_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<HistoryLocalDatasource>(),
  MockSpec<HistoryFirestoreDatasource>(),
])
void main() {
  late MockHistoryLocalDatasource localDatasource;
  late MockHistoryFirestoreDatasource firestoreDatasource;
  late HistoryRepositoryImpl repository;

  final olderLocal = GameHistoryItem(
    id: 'local-1',
    source: GameHistorySource.local,
    finishedAt: DateTime(2026, 1, 1),
    playerCount: 4,
    displayLabel: '1 ene 2026, 00:00 — Ana',
    winnerName: 'Ana',
    winnerScore: 20,
  );

  final newerLocal = GameHistoryItem(
    id: 'local-2',
    source: GameHistorySource.local,
    finishedAt: DateTime(2026, 3, 1),
    playerCount: 4,
    displayLabel: '1 mar 2026, 00:00 — Luis',
    winnerName: 'Luis',
    winnerScore: 30,
  );

  final syncedLocal = GameHistoryItem(
    id: 'local-synced',
    source: GameHistorySource.local,
    finishedAt: DateTime(2026, 3, 1),
    playerCount: 4,
    displayLabel: '1 mar 2026, 00:00 — Luis',
    winnerName: 'Luis',
    winnerScore: 30,
    cloudGameId: 'cloud-1',
  );

  final cloudItem = GameHistoryItem(
    id: 'cloud-1',
    source: GameHistorySource.cloud,
    finishedAt: DateTime(2026, 2, 1),
    playerCount: 4,
    displayLabel: '1 feb 2026, 00:00 — Luis',
    winnerName: 'Luis',
    winnerScore: 30,
  );

  setUp(() {
    localDatasource = MockHistoryLocalDatasource();
    firestoreDatasource = MockHistoryFirestoreDatasource();
    repository = HistoryRepositoryImpl(localDatasource, firestoreDatasource);
  });

  test('merges local and cloud items sorted by finishedAt desc', () async {
    when(localDatasource.getFinishedGames()).thenAnswer((_) async => [
          olderLocal,
          newerLocal,
        ]);
    when(firestoreDatasource.getFinishedCloudGames())
        .thenAnswer((_) async => [cloudItem]);

    final items = await repository.getGameHistory();

    expect(items, hasLength(3));
    expect(items.map((item) => item.id), ['local-2', 'cloud-1', 'local-1']);
  });

  test('deduplicates local items already present in cloud by cloudGameId', () async {
    when(localDatasource.getFinishedGames())
        .thenAnswer((_) async => [syncedLocal]);
    when(firestoreDatasource.getFinishedCloudGames())
        .thenAnswer((_) async => [cloudItem]);

    final items = await repository.getGameHistory();

    expect(items, hasLength(1));
    expect(items.single.id, 'cloud-1');
    expect(items.single.source, GameHistorySource.cloud);
  });

  test('returns only local items when cloud datasource is empty', () async {
    when(localDatasource.getFinishedGames())
        .thenAnswer((_) async => [olderLocal]);
    when(firestoreDatasource.getFinishedCloudGames())
        .thenAnswer((_) async => []);

    final items = await repository.getGameHistory();

    expect(items, hasLength(1));
    expect(items.single.source, GameHistorySource.local);
  });
}
