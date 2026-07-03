import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';

void main() {
  late AppDatabase database;

  setUp(() {
    database = AppDatabase.forTesting();
  });

  tearDown(() async {
    await database.close();
  });

  test('inserts and reads a setup game with round sequence', () async {
    const gameId = 'test-game-id';
    final roundSequence = [
      const RoundDefinition(roundNumber: 1, cardsPerPlayer: 1),
      const RoundDefinition(roundNumber: 2, cardsPerPlayer: 2),
    ];
    final now = DateTime(2026, 1, 1, 12);

    await database.into(database.games).insert(
          GamesCompanion.insert(
            id: gameId,
            status: 'setup',
            playerCount: 4,
            totalCards: 40,
            maxCardsPerRound: 10,
            roundSequence: roundSequence,
            createdAt: now,
            updatedAt: now,
          ),
        );

    final stored = await (database.select(database.games)
          ..where((table) => table.id.equals(gameId)))
        .getSingle();

    expect(stored.status, 'setup');
    expect(stored.playerCount, 4);
    expect(stored.totalCards, 40);
    expect(stored.maxCardsPerRound, 10);
    expect(stored.roundSequence, roundSequence);
    expect(stored.createdAt, now);
    expect(stored.updatedAt, now);
  });
}
