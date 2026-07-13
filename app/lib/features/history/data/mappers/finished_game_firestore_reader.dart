import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/sync/domain/entities/sync_status.dart';

class FinishedGameFirestoreReader {
  const FinishedGameFirestoreReader._();

  static Game gameFromDocument({
    required String gameId,
    required Map<String, dynamic> data,
  }) {
    final status = data['status'] as String?;
    if (status != 'finished') {
      throw StateError('Game is not finished');
    }

    final finishedAt = _readTimestamp(data['finishedAt']);
    if (finishedAt == null) {
      throw StateError('Finished game missing finishedAt');
    }

    final roundSequenceRaw = data['roundSequence'] as List<dynamic>? ?? [];
    final roundSequence = roundSequenceRaw
        .asMap()
        .entries
        .map(
          (entry) => RoundDefinition(
            roundNumber: entry.key + 1,
            cardsPerPlayer: entry.value as int,
          ),
        )
        .toList();

    final playersRaw = data['players'] as List<dynamic>? ?? [];
    final players = playersRaw
        .map((player) => playerFromMap(player as Map<String, dynamic>))
        .toList();

    return Game(
      id: gameId,
      status: GameStatus.finished,
      playerCount: data['playerCount'] as int? ?? players.length,
      totalCards: data['deckSize'] as int? ?? 40,
      maxCardsPerRound: data['maxCardsPerRound'] as int? ?? 0,
      roundSequence: roundSequence,
      players: players,
      firstDealerPlayerId: data['firstDealerPlayerId'] as String?,
      startedAt: _readTimestamp(data['startedAt']),
      currentRoundNumber: data['currentRoundNumber'] as int?,
      finishedAt: finishedAt,
      cloudGameId: gameId,
      syncStatus: SyncStatus.synced,
      createdAt: _readTimestamp(data['createdAt']) ?? finishedAt,
      updatedAt: _readTimestamp(data['updatedAt']) ?? finishedAt,
    );
  }

  static Round roundFromDocument({
    required String gameId,
    required String roundId,
    required Map<String, dynamic> data,
  }) {
    final status = data['status'] as String?;
    if (status != 'closed') {
      throw StateError('Round is not closed');
    }

    return Round(
      id: roundId,
      gameId: gameId,
      roundNumber: data['roundNumber'] as int,
      cardsInRound: data['cardsInRound'] as int,
      dealerPlayerId: data['dealerPlayerId'] as String,
      status: RoundStatus.closed,
      bids: Map<String, int>.from(data['bids'] as Map? ?? {}),
      tricks: Map<String, int>.from(data['tricks'] as Map? ?? {}),
      scoresDelta: Map<String, int>.from(data['scoresDelta'] as Map? ?? {}),
      createdAt: _readTimestamp(data['createdAt']) ?? DateTime.now(),
      closedAt: _readTimestamp(data['closedAt']),
    );
  }

  static PlayerEmbed playerFromMap(Map<String, dynamic> data) {
    return PlayerEmbed(
      id: data['id'] as String,
      displayName: data['displayName'] as String,
      isGuest: data['isGuest'] as bool? ?? false,
      userId: data['userId'] as String?,
      seatOrder: data['seatOrder'] as int,
      totalScore: data['totalScore'] as int? ?? 0,
      joinedAt: _readTimestamp(data['joinedAt']) ?? DateTime.now(),
    );
  }

  static DateTime? _readTimestamp(dynamic value) {
    if (value is Timestamp) {
      return value.toDate();
    }
    if (value is DateTime) {
      return value;
    }
    return null;
  }
}
