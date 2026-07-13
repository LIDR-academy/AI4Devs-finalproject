import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';

class RoundSummary extends Equatable {
  const RoundSummary({
    required this.round,
    required this.dealerDisplayName,
    required this.cumulativeRanking,
  });

  final Round round;
  final String dealerDisplayName;
  final List<RankingEntry> cumulativeRanking;

  @override
  List<Object?> get props => [round, dealerDisplayName, cumulativeRanking];
}
