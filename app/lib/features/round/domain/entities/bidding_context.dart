import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';

class BiddingContext extends Equatable {
  const BiddingContext({
    required this.game,
    required this.round,
    required this.biddingOrder,
    required this.currentPlayerId,
  });

  final Game game;
  final Round round;
  final List<String> biddingOrder;
  final String? currentPlayerId;

  @override
  List<Object?> get props => [game, round, biddingOrder, currentPlayerId];
}
