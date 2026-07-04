import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';

import 'ranking_entry.dart';

class RoundResult extends Equatable {
  const RoundResult({
    required this.game,
    required this.round,
    required this.entries,
    required this.dealerDisplayName,
    required this.isLastRound,
  });

  final Game game;
  final Round round;
  final List<RankingEntry> entries;
  final String dealerDisplayName;
  final bool isLastRound;

  @override
  List<Object?> get props => [game, round, entries, dealerDisplayName, isLastRound];
}
