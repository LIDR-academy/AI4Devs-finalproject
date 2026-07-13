import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/round/domain/services/bid_order_service.dart';

void main() {
  const service = BidOrderService();

  List<PlayerEmbed> playersForCount(int count) {
    return [
      for (var i = 0; i < count; i++)
        PlayerEmbed(
          id: 'p$i',
          displayName: 'Player $i',
          isGuest: true,
          userId: null,
          seatOrder: i,
          totalScore: 0,
          joinedAt: DateTime(2026),
        ),
    ];
  }

  group('BidOrderService', () {
    test('starts with player after dealer and ends with dealer for 3 players', () {
      final players = playersForCount(3);

      expect(
        service.biddingOrder(players: players, dealerPlayerId: 'p0'),
        ['p1', 'p2', 'p0'],
      );
    });

    test('starts with player after dealer and ends with dealer for 4 players', () {
      final players = playersForCount(4);

      expect(
        service.biddingOrder(players: players, dealerPlayerId: 'p2'),
        ['p3', 'p0', 'p1', 'p2'],
      );
    });

    test('dealer in last seat still bids last for 4 players', () {
      final players = playersForCount(4);

      expect(
        service.biddingOrder(players: players, dealerPlayerId: 'p3'),
        ['p0', 'p1', 'p2', 'p3'],
      );
    });

    test('handles 8 players with dealer in middle', () {
      final players = playersForCount(8);

      expect(
        service.biddingOrder(players: players, dealerPlayerId: 'p4'),
        ['p5', 'p6', 'p7', 'p0', 'p1', 'p2', 'p3', 'p4'],
      );
    });

    test('throws when dealer is not in roster', () {
      final players = playersForCount(3);

      expect(
        () => service.biddingOrder(players: players, dealerPlayerId: 'missing'),
        throwsArgumentError,
      );
    });

    test('throws when players list is empty', () {
      expect(
        () => service.biddingOrder(players: const [], dealerPlayerId: 'p0'),
        throwsArgumentError,
      );
    });
  });
}
