import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

class BidOrderService {
  const BidOrderService();

  List<String> biddingOrder({
    required List<PlayerEmbed> players,
    required String dealerPlayerId,
  }) {
    if (players.isEmpty) {
      throw ArgumentError('Players list must not be empty');
    }

    final ordered = List<PlayerEmbed>.from(players)
      ..sort((a, b) => a.seatOrder.compareTo(b.seatOrder));

    final dealerIndex =
        ordered.indexWhere((player) => player.id == dealerPlayerId);
    if (dealerIndex == -1) {
      throw ArgumentError('Dealer not found in roster: $dealerPlayerId');
    }

    return [
      for (var i = 1; i <= ordered.length; i++)
        ordered[(dealerIndex + i) % ordered.length].id,
    ];
  }
}
