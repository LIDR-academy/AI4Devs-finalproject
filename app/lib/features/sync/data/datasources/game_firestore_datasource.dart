import 'package:cloud_firestore/cloud_firestore.dart';

enum GameSyncFailureType {
  permissionDenied,
  networkUnavailable,
  invalidData,
  unknown,
}

class GameSyncException implements Exception {
  const GameSyncException(this.type, [this.message]);

  final GameSyncFailureType type;
  final String? message;

  @override
  String toString() => 'GameSyncException($type, $message)';
}

class GameFirestoreDatasource {
  GameFirestoreDatasource(this._firestore);

  final FirebaseFirestore _firestore;

  Future<void> uploadFinishedGame({
    required String gameId,
    required Map<String, dynamic> gameDocument,
    required List<Map<String, dynamic>> roundDocuments,
  }) async {
    try {
      final batch = _firestore.batch();
      final gameRef = _firestore.collection('games').doc(gameId);

      batch.set(gameRef, gameDocument);

      for (final roundDocument in roundDocuments) {
        final roundNumber = roundDocument['roundNumber'] as int;
        batch.set(
          gameRef.collection('rounds').doc('$roundNumber'),
          roundDocument,
        );
      }

      await batch.commit();
    } on FirebaseException catch (error) {
      throw _mapFirebaseException(error);
    }
  }

  GameSyncException _mapFirebaseException(FirebaseException error) {
    return switch (error.code) {
      'permission-denied' || 'unauthenticated' => GameSyncException(
          GameSyncFailureType.permissionDenied,
          error.message,
        ),
      'unavailable' ||
      'deadline-exceeded' ||
      'network-request-failed' =>
        GameSyncException(
          GameSyncFailureType.networkUnavailable,
          error.message,
        ),
      'invalid-argument' => GameSyncException(
          GameSyncFailureType.invalidData,
          error.message,
        ),
      _ => GameSyncException(
          GameSyncFailureType.unknown,
          error.message,
        ),
    };
  }
}
