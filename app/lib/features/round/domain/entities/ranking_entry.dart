import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

class RankingEntry extends Equatable {
  const RankingEntry({
    required this.player,
    required this.rank,
    required this.roundScore,
    required this.totalScore,
    this.positionDelta,
  });

  final PlayerEmbed player;
  final int rank;
  final int roundScore;
  final int totalScore;
  final int? positionDelta;

  @override
  List<Object?> get props => [player, rank, roundScore, totalScore, positionDelta];
}
