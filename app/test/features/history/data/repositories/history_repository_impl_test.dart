import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/history/data/datasources/hidden_games_local_datasource.dart';
import 'package:la_pocha/features/history/data/datasources/history_firestore_datasource.dart';
import 'package:la_pocha/features/history/data/datasources/history_local_datasource.dart';
import 'package:la_pocha/features/history/data/repositories/history_repository_impl.dart';
import 'package:la_pocha/features/history/domain/entities/game_detail.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'history_repository_impl_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<HistoryLocalDatasource>(),
  MockSpec<HistoryFirestoreDatasource>(),
  MockSpec<HiddenGamesLocalDatasource>(),
  MockSpec<GameRepository>(),
])
void main() {
  late MockHistoryLocalDatasource localDatasource;
  late MockHistoryFirestoreDatasource firestoreDatasource;
  late MockHiddenGamesLocalDatasource hiddenGamesDatasource;
  late MockGameRepository gameRepository;
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

  final hiddenCloudItem = GameHistoryItem(
    id: 'cloud-hidden',
    source: GameHistorySource.cloud,
    finishedAt: DateTime(2026, 4, 1),
    playerCount: 4,
    displayLabel: '1 abr 2026, 00:00 — Ana',
    winnerName: 'Ana',
    winnerScore: 15,
  );

  setUp(() {
    localDatasource = MockHistoryLocalDatasource();
    firestoreDatasource = MockHistoryFirestoreDatasource();
    hiddenGamesDatasource = MockHiddenGamesLocalDatasource();
    gameRepository = MockGameRepository();
    repository = HistoryRepositoryImpl(
      localDatasource,
      firestoreDatasource,
      hiddenGamesDatasource,
      gameRepository,
    );
    when(hiddenGamesDatasource.getHiddenGameIds())
        .thenAnswer((_) async => <String>{});
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

  test('excludes hidden cloud ids from merged history', () async {
    when(localDatasource.getFinishedGames())
        .thenAnswer((_) async => [olderLocal]);
    when(firestoreDatasource.getFinishedCloudGames()).thenAnswer(
      (_) async => [cloudItem, hiddenCloudItem],
    );
    when(hiddenGamesDatasource.getHiddenGameIds())
        .thenAnswer((_) async => {'cloud-hidden'});

    final items = await repository.getGameHistory();

    expect(items.map((item) => item.id), ['cloud-1', 'local-1']);
  });

  test('excludes local items whose cloudGameId is hidden', () async {
    when(localDatasource.getFinishedGames()).thenAnswer(
      (_) async => [
        GameHistoryItem(
          id: 'local-only-sync',
          source: GameHistorySource.local,
          finishedAt: DateTime(2026, 3, 1),
          playerCount: 4,
          displayLabel: '1 mar 2026, 00:00 — Luis',
          winnerName: 'Luis',
          winnerScore: 30,
          cloudGameId: 'cloud-1',
        ),
        olderLocal,
      ],
    );
    when(firestoreDatasource.getFinishedCloudGames())
        .thenAnswer((_) async => []);
    when(hiddenGamesDatasource.getHiddenGameIds())
        .thenAnswer((_) async => {'cloud-1'});

    final items = await repository.getGameHistory();

    expect(items, hasLength(1));
    expect(items.single.id, 'local-1');
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

  test('deleteLocalGame delegates to game repository', () async {
    when(gameRepository.deleteGame('local-1')).thenAnswer((_) async {});

    await repository.deleteLocalGame('local-1');

    verify(gameRepository.deleteGame('local-1')).called(1);
  });

  test('hideCloudGame writes to hidden games datasource only', () async {
    when(hiddenGamesDatasource.hideGame('cloud-1'))
        .thenAnswer((_) async {});

    await repository.hideCloudGame('cloud-1');

    verify(hiddenGamesDatasource.hideGame('cloud-1')).called(1);
    verifyNever(gameRepository.deleteGame(any));
  });

  group('getGameDetail', () {
    final players = [
      PlayerEmbed(
        id: 'p1',
        displayName: 'Ana',
        isGuest: true,
        userId: null,
        seatOrder: 1,
        totalScore: 10,
        joinedAt: DateTime(2026),
      ),
    ];

    final game = Game(
      id: 'game-1',
      status: GameStatus.finished,
      playerCount: 1,
      totalCards: 40,
      maxCardsPerRound: 10,
      roundSequence: const [RoundDefinition(roundNumber: 1, cardsPerPlayer: 4)],
      players: players,
      finishedAt: DateTime(2026),
      createdAt: DateTime(2026),
      updatedAt: DateTime(2026),
    );

    final round = Round(
      id: 'round-1',
      gameId: 'game-1',
      roundNumber: 1,
      cardsInRound: 4,
      dealerPlayerId: 'p1',
      status: RoundStatus.closed,
      bids: const {'p1': 2},
      tricks: const {'p1': 2},
      scoresDelta: const {'p1': 10},
      createdAt: DateTime(2026),
      closedAt: DateTime(2026),
    );

    test('loads detail from local datasource', () async {
      when(localDatasource.loadFinishedGameDetail('game-1')).thenAnswer(
        (_) async => (game: game, rounds: [round]),
      );

      final detail = await repository.getGameDetail(
        gameId: 'game-1',
        source: GameHistorySource.local,
      );

      expect(detail, isA<GameDetail>());
      expect(detail.source, GameHistorySource.local);
      expect(detail.roundSummaries, hasLength(1));
      verify(localDatasource.loadFinishedGameDetail('game-1')).called(1);
      verifyNever(firestoreDatasource.loadFinishedGameDetail(any));
    });

    test('loads detail from cloud datasource', () async {
      when(firestoreDatasource.loadFinishedGameDetail('cloud-1')).thenAnswer(
        (_) async => (game: game.copyWith(id: 'cloud-1'), rounds: [round]),
      );

      final detail = await repository.getGameDetail(
        gameId: 'cloud-1',
        source: GameHistorySource.cloud,
      );

      expect(detail.source, GameHistorySource.cloud);
      verify(firestoreDatasource.loadFinishedGameDetail('cloud-1')).called(1);
      verifyNever(localDatasource.loadFinishedGameDetail(any));
    });
  });
}
