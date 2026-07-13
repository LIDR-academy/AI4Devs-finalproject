import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/services/game_cloner_service.dart';
import 'package:la_pocha/features/sync/domain/entities/sync_status.dart';

void main() {
  const service = GameClonerService();
  final now = DateTime(2026, 7, 13, 12);

  Game finishedSourceGame() {
    return Game(
      id: 'source-game',
      status: GameStatus.finished,
      playerCount: 3,
      totalCards: 40,
      maxCardsPerRound: 13,
      roundSequence: const [
        RoundDefinition(roundNumber: 1, cardsPerPlayer: 1),
        RoundDefinition(roundNumber: 2, cardsPerPlayer: 2),
      ],
      players: [
        PlayerEmbed(
          id: 'player-1',
          displayName: 'Ana',
          isGuest: false,
          userId: 'user-ana',
          seatOrder: 0,
          totalScore: 42,
          joinedAt: DateTime(2026, 7, 1),
        ),
        PlayerEmbed(
          id: 'player-2',
          displayName: 'Carlos',
          isGuest: true,
          userId: null,
          seatOrder: 1,
          totalScore: 30,
          joinedAt: DateTime(2026, 7, 1),
        ),
      ],
      firstDealerPlayerId: 'player-1',
      startedAt: DateTime(2026, 7, 4, 20),
      currentRoundNumber: 2,
      finishedAt: DateTime(2026, 7, 4, 22),
      cloudGameId: 'cloud-123',
      syncStatus: SyncStatus.synced,
      createdAt: DateTime(2026, 7, 4, 19),
      updatedAt: DateTime(2026, 7, 4, 22),
    );
  }

  group('GameClonerService', () {
    test('copies config and player identity without scores', () {
      var playerIdCounter = 0;
      final cloned = service.cloneForRepeat(
        source: finishedSourceGame(),
        newGameId: 'new-game',
        now: now,
        generatePlayerId: () => 'new-player-${++playerIdCounter}',
      );

      expect(cloned.id, 'new-game');
      expect(cloned.status, GameStatus.setup);
      expect(cloned.playerCount, 3);
      expect(cloned.totalCards, 40);
      expect(cloned.maxCardsPerRound, 13);
      expect(cloned.roundSequence, finishedSourceGame().roundSequence);
      expect(cloned.players, hasLength(2));

      final ana = cloned.players[0];
      expect(ana.id, 'new-player-1');
      expect(ana.displayName, 'Ana');
      expect(ana.userId, 'user-ana');
      expect(ana.isGuest, isFalse);
      expect(ana.seatOrder, 0);
      expect(ana.totalScore, 0);
      expect(ana.joinedAt, now);

      final carlos = cloned.players[1];
      expect(carlos.id, 'new-player-2');
      expect(carlos.displayName, 'Carlos');
      expect(carlos.userId, isNull);
      expect(carlos.isGuest, isTrue);
      expect(carlos.seatOrder, 1);
      expect(carlos.totalScore, 0);
      expect(carlos.joinedAt, now);
    });

    test('excludes game lifecycle and sync metadata', () {
      final cloned = service.cloneForRepeat(
        source: finishedSourceGame(),
        newGameId: 'new-game',
        now: now,
        generatePlayerId: () => 'new-player',
      );

      expect(cloned.firstDealerPlayerId, isNull);
      expect(cloned.startedAt, isNull);
      expect(cloned.currentRoundNumber, isNull);
      expect(cloned.finishedAt, isNull);
      expect(cloned.cloudGameId, isNull);
      expect(cloned.syncStatus, isNull);
      expect(cloned.createdAt, now);
      expect(cloned.updatedAt, now);
    });

    test('generates distinct player ids from source', () {
      final cloned = service.cloneForRepeat(
        source: finishedSourceGame(),
        newGameId: 'new-game',
        now: now,
        generatePlayerId: () => 'generated-id',
      );

      expect(cloned.players.every((player) => player.id == 'generated-id'), isTrue);
      expect(
        cloned.players.map((player) => player.id),
        isNot(equals(finishedSourceGame().players.map((player) => player.id))),
      );
    });
  });
}
