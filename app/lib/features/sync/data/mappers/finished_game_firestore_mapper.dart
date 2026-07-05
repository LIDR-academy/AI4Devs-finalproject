import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';

class FinishedGameFirestoreMapper {
  const FinishedGameFirestoreMapper._();

  static Map<String, dynamic> toGameDocument({
    required Game game,
    required String hostId,
  }) {
    if (game.status != GameStatus.finished || game.finishedAt == null) {
      throw StateError('Only finished games can be uploaded');
    }

    return {
      'hostId': hostId,
      'participantIds': _participantIds(game.players),
      'status': 'finished',
      'playerCount': game.playerCount,
      'deckSize': game.totalCards,
      'maxCardsPerRound': game.maxCardsPerRound,
      'totalRounds': game.roundSequence.length,
      'roundSequence': game.roundSequence
          .map((round) => round.cardsPerPlayer)
          .toList(growable: false),
      'players': game.players.map(_playerToMap).toList(growable: false),
      'firstDealerPlayerId': game.firstDealerPlayerId,
      'currentRoundNumber': game.currentRoundNumber ?? game.roundSequence.length,
      'createdAt': Timestamp.fromDate(game.createdAt),
      'updatedAt': FieldValue.serverTimestamp(),
      'finishedAt': Timestamp.fromDate(game.finishedAt!),
      if (game.startedAt != null)
        'startedAt': Timestamp.fromDate(game.startedAt!),
    };
  }

  static Map<String, dynamic> toRoundDocument(Round round) {
    if (round.status != RoundStatus.closed) {
      throw StateError('Only closed rounds can be uploaded');
    }

    return {
      'roundNumber': round.roundNumber,
      'cardsInRound': round.cardsInRound,
      'dealerPlayerId': round.dealerPlayerId,
      'status': 'closed',
      'bids': round.bids,
      'tricks': round.tricks ?? const {},
      'scoresDelta': round.scoresDelta ?? const {},
      'createdAt': Timestamp.fromDate(round.createdAt),
      if (round.closedAt != null)
        'closedAt': Timestamp.fromDate(round.closedAt!),
    };
  }

  static List<String> _participantIds(List<PlayerEmbed> players) {
    return players
        .where((player) => player.userId != null)
        .map((player) => player.userId!)
        .toSet()
        .toList(growable: false);
  }

  static Map<String, dynamic> _playerToMap(PlayerEmbed player) {
    return {
      'id': player.id,
      'displayName': player.displayName,
      'userId': player.userId,
      'isGuest': player.isGuest,
      'seatOrder': player.seatOrder,
      'totalScore': player.totalScore,
      'joinedAt': Timestamp.fromDate(player.joinedAt),
    };
  }
}
