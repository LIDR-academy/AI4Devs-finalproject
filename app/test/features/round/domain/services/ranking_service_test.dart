import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/round/domain/services/ranking_service.dart';

void main() {
  const service = RankingService();

  PlayerEmbed player({
    required String id,
    required String name,
    required int totalScore,
    int seatOrder = 0,
  }) {
    return PlayerEmbed(
      id: id,
      displayName: name,
      isGuest: true,
      userId: null,
      seatOrder: seatOrder,
      totalScore: totalScore,
      joinedAt: DateTime(2026),
    );
  }

  group('RankingService', () {
    test('orders players by totalScore descending', () {
      final entries = service.buildRanking(
        players: [
          player(id: 'p1', name: 'Ana', totalScore: 5),
          player(id: 'p2', name: 'Bob', totalScore: 15),
          player(id: 'p3', name: 'Car', totalScore: 10),
        ],
        scoresDelta: const {'p1': 5, 'p2': 10, 'p3': 0},
      );

      expect(entries.map((e) => e.player.id).toList(), ['p2', 'p3', 'p1']);
      expect(entries.map((e) => e.rank).toList(), [1, 2, 3]);
    });

    test('assigns same rank to tied totalScore', () {
      final entries = service.buildRanking(
        players: [
          player(id: 'p1', name: 'Ana', totalScore: 10),
          player(id: 'p2', name: 'Bob', totalScore: 10),
          player(id: 'p3', name: 'Car', totalScore: 5),
        ],
        scoresDelta: const {'p1': 5, 'p2': 5, 'p3': -5},
      );

      expect(entries[0].rank, 1);
      expect(entries[1].rank, 1);
      expect(entries[2].rank, 3);
    });

    test('calculates position delta vs before round', () {
      final entries = service.buildRanking(
        players: [
          player(id: 'p1', name: 'Ana', totalScore: 20),
          player(id: 'p2', name: 'Bob', totalScore: 15),
          player(id: 'p3', name: 'Car', totalScore: 10),
        ],
        scoresDelta: const {'p1': 0, 'p2': 10, 'p3': -5},
      );

      final byId = {for (final e in entries) e.player.id: e};
      expect(byId['p1']!.positionDelta, 0);
      expect(byId['p2']!.positionDelta, 1);
      expect(byId['p3']!.positionDelta, -1);
    });

    test('omits position delta when includePositionDelta is false', () {
      final entries = service.buildRanking(
        players: [player(id: 'p1', name: 'Ana', totalScore: 10)],
        scoresDelta: const {'p1': 10},
        includePositionDelta: false,
      );

      expect(entries.single.positionDelta, isNull);
    });
  });
}
