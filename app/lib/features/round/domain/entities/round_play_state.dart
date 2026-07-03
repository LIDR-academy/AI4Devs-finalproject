import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';

class RoundPlayState extends Equatable {
  const RoundPlayState({
    required this.game,
    required this.round,
    required this.players,
    required this.bidSum,
    required this.restrictionMet,
  });

  final Game game;
  final Round round;
  final List<PlayerEmbed> players;
  final int bidSum;
  final bool restrictionMet;

  @override
  List<Object?> get props => [game, round, players, bidSum, restrictionMet];
}
