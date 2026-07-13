import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/history/domain/entities/game_detail.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/entities/round_summary.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';
import 'package:la_pocha/features/round/domain/services/ranking_service.dart';

class GameDetailMapper {
  const GameDetailMapper({RankingService? rankingService})
      : _rankingService = rankingService ?? const RankingService();

  final RankingService _rankingService;

  GameDetail buildGameDetail({
    required Game game,
    required List<Round> rounds,
    required GameHistorySource source,
  }) {
    final closedRounds = _validateAndSortRounds(rounds);
    final roundSummaries = buildRoundSummaries(game: game, rounds: closedRounds);
    final finalRanking = buildFinalRanking(game: game, rounds: closedRounds);

    Duration? duration;
    if (game.startedAt != null && game.finishedAt != null) {
      duration = game.finishedAt!.difference(game.startedAt!);
    }

    return GameDetail(
      game: game,
      roundSummaries: roundSummaries,
      finalRanking: finalRanking,
      source: source,
      duration: duration,
    );
  }

  List<RoundSummary> buildRoundSummaries({
    required Game game,
    required List<Round> rounds,
  }) {
    final closedRounds = _validateAndSortRounds(rounds);
    final cumulativeScores = {
      for (final player in game.players) player.id: 0,
    };

    return closedRounds.map((round) {
      final scoresDelta = round.scoresDelta ?? const {};
      for (final entry in scoresDelta.entries) {
        cumulativeScores[entry.key] =
            (cumulativeScores[entry.key] ?? 0) + entry.value;
      }

      final playersAtRound = game.players
          .map(
            (player) => player.copyWith(
              totalScore: cumulativeScores[player.id] ?? 0,
            ),
          )
          .toList();

      final dealer = game.players.firstWhere(
        (player) => player.id == round.dealerPlayerId,
        orElse: () =>
            throw StateError('Dealer not found: ${round.dealerPlayerId}'),
      );

      final cumulativeRanking = _rankingService.buildRanking(
        players: playersAtRound,
        scoresDelta: scoresDelta,
        includePositionDelta: false,
      );

      return RoundSummary(
        round: round,
        dealerDisplayName: dealer.displayName,
        cumulativeRanking: cumulativeRanking,
      );
    }).toList();
  }

  List<RankingEntry> buildFinalRanking({
    required Game game,
    required List<Round> rounds,
  }) {
    final closedRounds = _validateAndSortRounds(rounds);
    if (closedRounds.isEmpty) {
      return _rankingService.buildRanking(
        players: game.players,
        scoresDelta: const {},
        includePositionDelta: false,
      );
    }

    final lastRound = closedRounds.last;
    return _rankingService.buildRanking(
      players: game.players,
      scoresDelta: lastRound.scoresDelta ?? const {},
      includePositionDelta: false,
    );
  }

  List<Round> _validateAndSortRounds(List<Round> rounds) {
    final sorted = List<Round>.from(rounds)
      ..sort((a, b) => a.roundNumber.compareTo(b.roundNumber));

    for (final round in sorted) {
      if (round.status != RoundStatus.closed) {
        throw StateError('Round ${round.roundNumber} is not closed');
      }
      if (round.scoresDelta == null) {
        throw StateError('Round ${round.roundNumber} has no scores delta');
      }
    }

    return sorted;
  }
}
