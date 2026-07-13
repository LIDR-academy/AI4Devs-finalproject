import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';

import 'game_history_source.dart';
import 'round_summary.dart';

class GameDetail extends Equatable {
  const GameDetail({
    required this.game,
    required this.roundSummaries,
    required this.finalRanking,
    required this.source,
    this.duration,
  });

  final Game game;
  final List<RoundSummary> roundSummaries;
  final List<RankingEntry> finalRanking;
  final GameHistorySource source;
  final Duration? duration;

  @override
  List<Object?> get props => [
        game,
        roundSummaries,
        finalRanking,
        source,
        duration,
      ];
}
