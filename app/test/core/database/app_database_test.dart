import 'package:drift/drift.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';

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

  test('inserts and reads a round entry', () async {
    const gameId = 'test-game-id';
    const roundId = 'round-id';
    final now = DateTime(2026, 1, 1, 12);

    await database.into(database.rounds).insert(
          RoundsCompanion.insert(
            id: roundId,
            gameId: gameId,
            roundNumber: 1,
            cardsInRound: 4,
            dealerPlayerId: 'player-1',
            status: RoundStatus.bidding.toStorageString(),
            bids: const {},
            createdAt: now,
          ),
        );

    final stored = await (database.select(database.rounds)
          ..where((table) => table.id.equals(roundId)))
        .getSingle();

    expect(stored.gameId, gameId);
    expect(stored.roundNumber, 1);
    expect(stored.cardsInRound, 4);
    expect(stored.dealerPlayerId, 'player-1');
    expect(stored.status, 'bidding');
    expect(stored.bids, isEmpty);
  });

  test('startGame persists game status and round atomically', () async {
    const gameId = 'test-game-id';
    final roundSequence = [
      const RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
    ];
    final now = DateTime(2026, 1, 1, 12);
    final players = [
      PlayerEmbed(
        id: 'p1',
        displayName: 'Ana',
        isGuest: true,
        userId: null,
        seatOrder: 1,
        totalScore: 0,
        joinedAt: now,
      ),
      PlayerEmbed(
        id: 'p2',
        displayName: 'Bob',
        isGuest: true,
        userId: null,
        seatOrder: 2,
        totalScore: 0,
        joinedAt: now,
      ),
    ];

    await database.into(database.games).insert(
          GamesCompanion.insert(
            id: gameId,
            status: 'setup',
            playerCount: 2,
            totalCards: 40,
            maxCardsPerRound: 10,
            roundSequence: roundSequence,
            players: Value(players),
            createdAt: now,
            updatedAt: now,
          ),
        );

    final datasource = GameLocalDatasource(database);
    final result = await datasource.startGame(
      gameId: gameId,
      players: players,
      firstDealerPlayerId: 'p1',
      firstRound: Round(
        id: '',
        gameId: gameId,
        roundNumber: 1,
        cardsInRound: 4,
        dealerPlayerId: 'p1',
        status: RoundStatus.bidding,
        bids: const {},
        createdAt: now,
      ),
    );

    final storedGame = await (database.select(database.games)
          ..where((table) => table.id.equals(gameId)))
        .getSingle();
    final storedRound = await (database.select(database.rounds)
          ..where((table) => table.id.equals(result.roundId)))
        .getSingle();

    expect(storedGame.status, 'in_progress');
    expect(storedGame.firstDealerPlayerId, 'p1');
    expect(storedGame.currentRoundNumber, 1);
    expect(storedGame.startedAt, isNot(null));
    expect(storedRound.roundNumber, 1);
    expect(storedRound.cardsInRound, 4);
    expect(storedRound.dealerPlayerId, 'p1');
  });

  test('deleteGame removes the game and all its rounds', () async {
    const gameId = 'test-game-id';
    const otherGameId = 'other-game-id';
    final roundSequence = [
      const RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
      const RoundDefinition(roundNumber: 2, cardsPerPlayer: 5),
    ];
    final now = DateTime(2026, 1, 1, 12);

    await database.into(database.games).insert(
          GamesCompanion.insert(
            id: gameId,
            status: 'in_progress',
            playerCount: 2,
            totalCards: 40,
            maxCardsPerRound: 10,
            roundSequence: roundSequence,
            createdAt: now,
            updatedAt: now,
          ),
        );
    await database.into(database.games).insert(
          GamesCompanion.insert(
            id: otherGameId,
            status: 'in_progress',
            playerCount: 2,
            totalCards: 40,
            maxCardsPerRound: 10,
            roundSequence: roundSequence,
            createdAt: now,
            updatedAt: now,
          ),
        );

    for (final entry in [
      (id: 'round-1', gameId: gameId, roundNumber: 1),
      (id: 'round-2', gameId: gameId, roundNumber: 2),
      (id: 'other-round-1', gameId: otherGameId, roundNumber: 1),
    ]) {
      await database.into(database.rounds).insert(
            RoundsCompanion.insert(
              id: entry.id,
              gameId: entry.gameId,
              roundNumber: entry.roundNumber,
              cardsInRound: 4,
              dealerPlayerId: 'p1',
              status: RoundStatus.bidding.toStorageString(),
              bids: const {},
              createdAt: now,
            ),
          );
    }

    final datasource = GameLocalDatasource(database);
    await datasource.deleteGame(gameId);

    final remainingGames = await database.select(database.games).get();
    final remainingRounds = await database.select(database.rounds).get();

    expect(remainingGames.map((g) => g.id), [otherGameId]);
    expect(remainingRounds.map((r) => r.id), ['other-round-1']);
  });
}
