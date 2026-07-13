import '../entities/player_embed.dart';

class SetFirstDealerUseCase {
  const SetFirstDealerUseCase();

  String call({
    required List<PlayerEmbed> players,
    required String playerId,
  }) {
    final exists = players.any((player) => player.id == playerId);
    if (!exists) {
      throw ArgumentError.value(
        playerId,
        'playerId',
        'Player not found in roster',
      );
    }
    return playerId;
  }
}
