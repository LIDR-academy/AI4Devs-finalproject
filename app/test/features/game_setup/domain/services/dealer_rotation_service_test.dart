import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/services/dealer_rotation_service.dart';

void main() {
  const service = DealerRotationService();

  List<PlayerEmbed> playersForCount(int count) {
    return [
      for (var i = 0; i < count; i++)
        PlayerEmbed(
          id: 'p$i',
          displayName: 'Player $i',
          isGuest: true,
          userId: null,
          seatOrder: i + 1,
          totalScore: 0,
          joinedAt: DateTime(2026),
        ),
    ];
  }

  group('DealerRotationService', () {
    test('rotates correctly with 3 players', () {
      final players = playersForCount(3);

      expect(
        service.nextDealer(players: players, currentDealerId: 'p0'),
        'p1',
      );
      expect(
        service.nextDealer(players: players, currentDealerId: 'p1'),
        'p2',
      );
      expect(
        service.nextDealer(players: players, currentDealerId: 'p2'),
        'p0',
      );
    });

    test('rotates correctly with 4 players', () {
      final players = playersForCount(4);

      expect(
        service.nextDealer(players: players, currentDealerId: 'p0'),
        'p1',
      );
      expect(
        service.nextDealer(players: players, currentDealerId: 'p3'),
        'p0',
      );
    });

    test('rotates correctly with 8 players', () {
      final players = playersForCount(8);

      expect(
        service.nextDealer(players: players, currentDealerId: 'p7'),
        'p0',
      );
      expect(
        service.nextDealer(players: players, currentDealerId: 'p4'),
        'p5',
      );
    });
  });
}
