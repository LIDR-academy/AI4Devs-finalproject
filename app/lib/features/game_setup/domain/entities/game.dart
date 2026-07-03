import 'package:equatable/equatable.dart';

import 'game_status.dart';
import 'player_embed.dart';
import 'round_definition.dart';

class Game extends Equatable {
  const Game({
    required this.id,
    required this.status,
    required this.playerCount,
    required this.totalCards,
    required this.maxCardsPerRound,
    required this.roundSequence,
    required this.players,
    this.firstDealerPlayerId,
    this.startedAt,
    this.currentRoundNumber,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final GameStatus status;
  final int playerCount;
  final int totalCards;
  final int maxCardsPerRound;
  final List<RoundDefinition> roundSequence;
  final List<PlayerEmbed> players;
  final String? firstDealerPlayerId;
  final DateTime? startedAt;
  final int? currentRoundNumber;
  final DateTime createdAt;
  final DateTime updatedAt;

  Game copyWith({
    String? id,
    GameStatus? status,
    int? playerCount,
    int? totalCards,
    int? maxCardsPerRound,
    List<RoundDefinition>? roundSequence,
    List<PlayerEmbed>? players,
    String? firstDealerPlayerId,
    DateTime? startedAt,
    int? currentRoundNumber,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Game(
      id: id ?? this.id,
      status: status ?? this.status,
      playerCount: playerCount ?? this.playerCount,
      totalCards: totalCards ?? this.totalCards,
      maxCardsPerRound: maxCardsPerRound ?? this.maxCardsPerRound,
      roundSequence: roundSequence ?? this.roundSequence,
      players: players ?? this.players,
      firstDealerPlayerId: firstDealerPlayerId ?? this.firstDealerPlayerId,
      startedAt: startedAt ?? this.startedAt,
      currentRoundNumber: currentRoundNumber ?? this.currentRoundNumber,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        status,
        playerCount,
        totalCards,
        maxCardsPerRound,
        roundSequence,
        players,
        firstDealerPlayerId,
        startedAt,
        currentRoundNumber,
        createdAt,
        updatedAt,
      ];
}
