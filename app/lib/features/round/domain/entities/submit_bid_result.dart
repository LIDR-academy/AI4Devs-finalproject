import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';

class SubmitBidResult extends Equatable {
  const SubmitBidResult({
    required this.round,
    required this.biddingOrder,
    required this.currentPlayerId,
  });

  final Round round;
  final List<String> biddingOrder;
  final String? currentPlayerId;

  @override
  List<Object?> get props => [round, biddingOrder, currentPlayerId];
}
