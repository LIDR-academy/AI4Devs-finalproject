import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/history/data/mappers/finished_game_firestore_reader.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/services/game_history_mapper.dart';
import 'package:la_pocha/features/sync/data/datasources/game_firestore_datasource.dart';

class HistoryFirestoreDatasource {
  HistoryFirestoreDatasource(
    this._firestore,
    this._auth, {
    GameHistoryMapper? mapper,
  }) : _mapper = mapper ?? const GameHistoryMapper();

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;
  final GameHistoryMapper _mapper;

  Future<List<GameHistoryItem>> getFinishedCloudGames() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) {
      return [];
    }

    try {
      final gamesById = <String, QueryDocumentSnapshot<Map<String, dynamic>>>{};

      final hostSnapshot = await _firestore
          .collection('games')
          .where('hostId', isEqualTo: uid)
          .where('status', isEqualTo: 'finished')
          .orderBy('finishedAt', descending: true)
          .get();

      for (final doc in hostSnapshot.docs) {
        gamesById[doc.id] = doc;
      }

      final participantSnapshot = await _firestore
          .collection('games')
          .where('participantIds', arrayContains: uid)
          .where('status', isEqualTo: 'finished')
          .orderBy('finishedAt', descending: true)
          .get();

      for (final doc in participantSnapshot.docs) {
        gamesById.putIfAbsent(doc.id, () => doc);
      }

      final items = gamesById.values
          .map(_mapDocumentToHistoryItem)
          .whereType<GameHistoryItem>()
          .toList()
        ..sort((a, b) => b.finishedAt.compareTo(a.finishedAt));

      return items;
    } on FirebaseException catch (error) {
      throw GameSyncException(
        _mapFailureType(error.code),
        error.message,
      );
    }
  }

  GameHistoryItem? _mapDocumentToHistoryItem(
    QueryDocumentSnapshot<Map<String, dynamic>> doc,
  ) {
    try {
      final game = FinishedGameFirestoreReader.gameFromDocument(
        gameId: doc.id,
        data: doc.data(),
      );
      return _mapper.fromCloudGame(game);
    } on StateError {
      return null;
    }
  }

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
