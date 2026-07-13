import 'package:equatable/equatable.dart';

import 'round_status.dart';

class Round extends Equatable {
  const Round({
    required this.id,
    required this.gameId,
    required this.roundNumber,
    required this.cardsInRound,
    required this.dealerPlayerId,
    required this.status,
    required this.bids,
    this.tricks,
    this.scoresDelta,
    required this.createdAt,
    this.closedAt,
  });

  final String id;
  final String gameId;
  final int roundNumber;
  final int cardsInRound;
  final String dealerPlayerId;
  final RoundStatus status;
  final Map<String, int> bids;
  final Map<String, int>? tricks;
  final Map<String, int>? scoresDelta;
  final DateTime createdAt;
  final DateTime? closedAt;

  Round resetToBidding() {
    return Round(
      id: id,
      gameId: gameId,
      roundNumber: roundNumber,
      cardsInRound: cardsInRound,
      dealerPlayerId: dealerPlayerId,
      status: RoundStatus.bidding,
      bids: const {},
      tricks: null,
      scoresDelta: null,
      createdAt: createdAt,
      closedAt: null,
    );
  }

  Round copyWith({
    String? id,
    String? gameId,
    int? roundNumber,
    int? cardsInRound,
    String? dealerPlayerId,
    RoundStatus? status,
    Map<String, int>? bids,
    Map<String, int>? tricks,
    Map<String, int>? scoresDelta,
    DateTime? createdAt,
    DateTime? closedAt,
  }) {
    return Round(
      id: id ?? this.id,
      gameId: gameId ?? this.gameId,
      roundNumber: roundNumber ?? this.roundNumber,
      cardsInRound: cardsInRound ?? this.cardsInRound,
      dealerPlayerId: dealerPlayerId ?? this.dealerPlayerId,
      status: status ?? this.status,
      bids: bids ?? this.bids,
      tricks: tricks ?? this.tricks,
      scoresDelta: scoresDelta ?? this.scoresDelta,
      createdAt: createdAt ?? this.createdAt,
      closedAt: closedAt ?? this.closedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        gameId,
        roundNumber,
        cardsInRound,
        dealerPlayerId,
        status,
        bids,
        tricks,
        scoresDelta,
        createdAt,
        closedAt,
      ];
}
