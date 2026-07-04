import 'package:drift/drift.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/history/data/datasources/history_local_datasource.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';

void main() {
  late AppDatabase database;
  late HistoryLocalDatasource datasource;

  setUp(() {
    database = AppDatabase.forTesting();
    datasource = HistoryLocalDatasource(database);
  });

  tearDown(() async {
    await database.close();
  });

  Future<void> insertFinishedGame({
    required String id,
    required DateTime finishedAt,
    required List<PlayerEmbed> players,
  }) async {
    await database.into(database.games).insert(
          GamesCompanion.insert(
            id: id,
            status: 'finished',
            playerCount: players.length,
            totalCards: 40,
            maxCardsPerRound: 10,
            roundSequence: const [RoundDefinition(roundNumber: 1, cardsPerPlayer: 4)],
            players: Value(players),
            finishedAt: Value(finishedAt),
            createdAt: finishedAt,
            updatedAt: finishedAt,
          ),
        );
  }

  test('returns only finished games ordered by finishedAt desc', () async {
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

    await insertFinishedGame(
      id: 'older',
      finishedAt: DateTime(2026, 1, 1, 10),
      players: players,
    );
    await insertFinishedGame(
      id: 'newer',
      finishedAt: DateTime(2026, 2, 1, 10),
      players: players,
    );
    await database.into(database.games).insert(
          GamesCompanion.insert(
            id: 'in-progress',
            status: 'in_progress',
            playerCount: 4,
            totalCards: 40,
            maxCardsPerRound: 10,
            roundSequence: const [RoundDefinition(roundNumber: 1, cardsPerPlayer: 4)],
            createdAt: DateTime(2026),
            updatedAt: DateTime(2026),
          ),
        );

    final items = await datasource.getFinishedGames();

    expect(items, hasLength(2));
    expect(items.first.id, 'newer');
    expect(items.last.id, 'older');
    expect(items.first.source, GameHistorySource.local);
    expect(items.first.displayLabel, contains('Ana'));
  });
}
