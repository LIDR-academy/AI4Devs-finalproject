import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/services/game_history_mapper.dart';

void main() {
  const mapper = GameHistoryMapper();

  final players = [
    PlayerEmbed(
      id: 'p2',
      displayName: 'Carlos',
      isGuest: true,
      userId: null,
      seatOrder: 2,
      totalScore: 30,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 42,
      joinedAt: DateTime(2026),
    ),
  ];

  final finishedGame = Game(
    id: 'game-1',
    status: GameStatus.finished,
    playerCount: 2,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [RoundDefinition(roundNumber: 1, cardsPerPlayer: 4)],
    players: players,
    finishedAt: DateTime(2026, 7, 4, 22, 5),
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  group('GameHistoryMapper', () {
    test('returns null for non-finished games', () {
      final item = mapper.fromLocalGame(
        finishedGame.copyWith(status: GameStatus.inProgress),
      );

      expect(item, isNull);
    });

    test('maps finished game with winner and display label', () {
      final item = mapper.fromLocalGame(finishedGame);

      expect(item, isNotNull);
      expect(item!.id, 'game-1');
      expect(item.source, GameHistorySource.local);
      expect(item.playerCount, 2);
      expect(item.winnerName, 'Ana');
      expect(item.winnerScore, 42);
      expect(item.displayLabel, '4 jul 2026, 22:05 — Ana, Carlos');
    });

    test('formats finishedAt in Spanish short month', () {
      expect(
        mapper.formatFinishedAt(DateTime(2026, 1, 15, 9, 3)),
        '15 ene 2026, 09:03',
      );
    });
  });
}
