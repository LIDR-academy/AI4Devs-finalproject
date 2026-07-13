import '../entities/player_embed.dart';

class ReorderPlayersUseCase {
  const ReorderPlayersUseCase();

  List<PlayerEmbed> call({
    required List<PlayerEmbed> players,
    required int oldIndex,
    required int newIndex,
  }) {
    if (oldIndex < 0 ||
        oldIndex >= players.length ||
        newIndex < 0 ||
        newIndex >= players.length) {
      throw RangeError('Invalid reorder indices: $oldIndex -> $newIndex');
    }

    final reordered = List<PlayerEmbed>.from(players);
    final moved = reordered.removeAt(oldIndex);
    reordered.insert(newIndex, moved);

    return [
      for (var i = 0; i < reordered.length; i++)
        reordered[i].copyWith(seatOrder: i + 1),
    ];
  }
}
