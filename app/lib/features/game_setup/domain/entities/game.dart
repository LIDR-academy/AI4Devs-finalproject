import 'package:equatable/equatable.dart';

import 'game_status.dart';
import 'round_definition.dart';

class Game extends Equatable {
  const Game({
    required this.id,
    required this.status,
    required this.playerCount,
    required this.totalCards,
    required this.maxCardsPerRound,
    required this.roundSequence,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final GameStatus status;
  final int playerCount;
  final int totalCards;
  final int maxCardsPerRound;
  final List<RoundDefinition> roundSequence;
  final DateTime createdAt;
  final DateTime updatedAt;

  @override
  List<Object?> get props => [
        id,
        status,
        playerCount,
        totalCards,
        maxCardsPerRound,
        roundSequence,
        createdAt,
        updatedAt,
      ];
}
