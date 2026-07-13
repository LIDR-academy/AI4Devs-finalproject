import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/history/data/mappers/finished_game_firestore_reader.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/sync/data/datasources/game_firestore_datasource.dart';

class HistoryFirestoreDatasource {
  HistoryFirestoreDatasource(this._firestore);

  final FirebaseFirestore _firestore;

  /// TODO(LPT-19): Require Firebase Auth session — query games where
  /// `hostId == uid` OR `players` contains `userId` (see firebase-data-access.yml).
  ///
  /// TODO(LPT-20): Deduplicate via `cloudGameId` set on local Game after upload.
  Future<List<GameHistoryItem>> getFinishedCloudGames() async => [];

  Future<({Game game, List<Round> rounds})> loadFinishedGameDetail(
    String gameId,
  ) async {
    try {
      final gameRef = _firestore.collection('games').doc(gameId);
      final gameSnapshot = await gameRef.get();

      if (!gameSnapshot.exists) {
        throw StateError('Game not found: $gameId');
      }

      final gameData = gameSnapshot.data();
      if (gameData == null) {
        throw StateError('Game not found: $gameId');
      }

      final game = FinishedGameFirestoreReader.gameFromDocument(
        gameId: gameId,
        data: gameData,
      );

      final roundsSnapshot = await gameRef
          .collection('rounds')
          .orderBy('roundNumber')
          .get();

      final rounds = roundsSnapshot.docs
          .map(
            (doc) => FinishedGameFirestoreReader.roundFromDocument(
              gameId: gameId,
              roundId: doc.id,
              data: doc.data(),
            ),
          )
          .where((round) => round.status == RoundStatus.closed)
          .toList();

      return (game: game, rounds: rounds);
    } on FirebaseException catch (error) {
      throw GameSyncException(
        _mapFailureType(error.code),
        error.message,
      );
    }
  }

  GameSyncFailureType _mapFailureType(String code) {
    return switch (code) {
      'permission-denied' || 'unauthenticated' =>
        GameSyncFailureType.permissionDenied,
      'unavailable' ||
      'deadline-exceeded' ||
      'network-request-failed' =>
        GameSyncFailureType.networkUnavailable,
      'invalid-argument' => GameSyncFailureType.invalidData,
      _ => GameSyncFailureType.unknown,
    };
  }
}
