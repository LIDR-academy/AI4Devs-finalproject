import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/data/datasources/round_local_datasource.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/sync/data/datasources/game_firestore_datasource.dart';
import 'package:la_pocha/features/sync/data/mappers/finished_game_firestore_mapper.dart';
import 'package:la_pocha/features/sync/domain/entities/sync_status.dart';
import 'package:la_pocha/features/sync/domain/repositories/game_sync_repository.dart';

class GameSyncRepositoryImpl implements GameSyncRepository {
  GameSyncRepositoryImpl({
    required GameLocalDatasource gameLocalDatasource,
    required RoundLocalDatasource roundLocalDatasource,
    required GameFirestoreDatasource firestoreDatasource,
  })  : _gameLocalDatasource = gameLocalDatasource,
        _roundLocalDatasource = roundLocalDatasource,
        _firestoreDatasource = firestoreDatasource;

  final GameLocalDatasource _gameLocalDatasource;
  final RoundLocalDatasource _roundLocalDatasource;
  final GameFirestoreDatasource _firestoreDatasource;

  @override
  Future<GameUploadResult> uploadFinishedGame({
    required String gameId,
    required String hostId,
  }) async {
    final game = await _gameLocalDatasource.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    if (game.status != GameStatus.finished) {
      throw StateError('Game must be finished to upload');
    }

    if (game.syncStatus == SyncStatus.synced || game.cloudGameId != null) {
      return GameUploadResult.skipped;
    }

    final rounds = await _roundLocalDatasource.getRoundsByGameId(gameId);
    if (rounds.length != game.roundSequence.length) {
      throw StateError('Incomplete round data for upload');
    }

    final gameDocument = FinishedGameFirestoreMapper.toGameDocument(
      game: game,
      hostId: hostId,
    );
    final roundDocuments = rounds
        .map(FinishedGameFirestoreMapper.toRoundDocument)
        .toList(growable: false);

    await _firestoreDatasource.uploadFinishedGame(
      gameId: gameId,
      gameDocument: gameDocument,
      roundDocuments: roundDocuments,
    );

    await _gameLocalDatasource.updateSyncMetadata(
      gameId: gameId,
      cloudGameId: gameId,
      syncStatus: SyncStatus.synced.toStorageString(),
    );

    return GameUploadResult.synced;
  }

  @override
  Future<List<Game>> getPendingGames() {
    return _gameLocalDatasource.getGamesBySyncStatus(
      SyncStatus.pending.toStorageString(),
    );
  }
}
