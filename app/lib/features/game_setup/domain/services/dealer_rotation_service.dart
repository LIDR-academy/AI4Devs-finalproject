import '../entities/player_embed.dart';

class DealerRotationService {
  const DealerRotationService();

  String nextDealer({
    required List<PlayerEmbed> players,
    required String currentDealerId,
  }) {
    if (players.isEmpty) {
      throw ArgumentError('Players list must not be empty');
    }

    final ordered = List<PlayerEmbed>.from(players)
      ..sort((a, b) => a.seatOrder.compareTo(b.seatOrder));

    final currentIndex = ordered.indexWhere((player) => player.id == currentDealerId);
    if (currentIndex == -1) {
      throw ArgumentError('Dealer not found in roster: $currentDealerId');
    }

    final nextIndex = (currentIndex + 1) % ordered.length;
    return ordered[nextIndex].id;
  }
}
