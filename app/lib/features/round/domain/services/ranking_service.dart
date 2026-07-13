import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';

class RankingService {
  const RankingService();

  List<RankingEntry> buildRanking({
    required List<PlayerEmbed> players,
    required Map<String, int> scoresDelta,
    bool includePositionDelta = true,
  }) {
    final sorted = List<PlayerEmbed>.from(players)
      ..sort((a, b) => b.totalScore.compareTo(a.totalScore));

    final currentRanks = _assignRanks(
      sorted.map((player) => MapEntry(player.id, player.totalScore)).toList(),
    );

    final Map<String, int> previousRanks = {};
    if (includePositionDelta) {
      final previousScores = players
          .map(
            (player) => MapEntry(
              player.id,
              player.totalScore - (scoresDelta[player.id] ?? 0),
            ),
          )
          .toList()
        ..sort((a, b) => b.value.compareTo(a.value));
      previousRanks.addAll(_assignRanks(previousScores));
    }

    return sorted.map((player) {
      final rank = currentRanks[player.id]!;
      final positionDelta = includePositionDelta
          ? previousRanks[player.id]! - rank
          : null;

      return RankingEntry(
        player: player,
        rank: rank,
        roundScore: scoresDelta[player.id] ?? 0,
        totalScore: player.totalScore,
        positionDelta: positionDelta,
      );
    }).toList();
  }

  Map<String, int> _assignRanks(List<MapEntry<String, int>> idAndScores) {
    final ranks = <String, int>{};
    var rank = 1;
    for (var i = 0; i < idAndScores.length; i++) {
      if (i > 0 && idAndScores[i].value < idAndScores[i - 1].value) {
        rank = i + 1;
      }
      ranks[idAndScores[i].key] = rank;
    }
    return ranks;
  }
}
