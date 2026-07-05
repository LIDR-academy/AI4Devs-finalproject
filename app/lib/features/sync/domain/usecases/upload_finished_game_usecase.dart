import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';
import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/sync/data/datasources/game_firestore_datasource.dart';
import 'package:la_pocha/features/sync/domain/entities/sync_status.dart';
import 'package:la_pocha/features/sync/domain/repositories/game_sync_repository.dart';

enum UploadFinishedGameOutcome {
  skippedNoSession,
  skippedAlreadySynced,
  synced,
  pending,
  failed,
}

class UploadFinishedGameUseCase {
  UploadFinishedGameUseCase({
    required AuthRepository authRepository,
    required GameSyncRepository gameSyncRepository,
    required GameLocalDatasource gameLocalDatasource,
    Connectivity? connectivity,
  })  : _authRepository = authRepository,
        _gameSyncRepository = gameSyncRepository,
        _gameLocalDatasource = gameLocalDatasource,
        _connectivity = connectivity ?? Connectivity();

  final AuthRepository _authRepository;
  final GameSyncRepository _gameSyncRepository;
  final GameLocalDatasource _gameLocalDatasource;
  final Connectivity _connectivity;

  Future<UploadFinishedGameOutcome> call({required String gameId}) async {
    final user = await _authRepository.getCurrentUser();
    if (user == null) {
      return UploadFinishedGameOutcome.skippedNoSession;
    }

    final game = await _gameLocalDatasource.getGameById(gameId);
    if (game == null) {
      return UploadFinishedGameOutcome.failed;
    }

    if (game.status != GameStatus.finished) {
      return UploadFinishedGameOutcome.failed;
    }

    if (game.syncStatus == SyncStatus.synced || game.cloudGameId != null) {
      return UploadFinishedGameOutcome.skippedAlreadySynced;
    }

    if (!await _hasConnectivity()) {
      await _gameLocalDatasource.updateSyncMetadata(
        gameId: gameId,
        syncStatus: SyncStatus.pending.toStorageString(),
      );
      return UploadFinishedGameOutcome.pending;
    }

    try {
      final result = await _gameSyncRepository.uploadFinishedGame(
        gameId: gameId,
        hostId: user.uid,
      );

      return switch (result) {
        GameUploadResult.synced => UploadFinishedGameOutcome.synced,
        GameUploadResult.skipped => UploadFinishedGameOutcome.skippedAlreadySynced,
      };
    } on GameSyncException catch (error) {
      final syncStatus = switch (error.type) {
        GameSyncFailureType.permissionDenied => SyncStatus.failed,
        GameSyncFailureType.networkUnavailable => SyncStatus.pending,
        GameSyncFailureType.invalidData => SyncStatus.failed,
        GameSyncFailureType.unknown => SyncStatus.pending,
      };

      await _gameLocalDatasource.updateSyncMetadata(
        gameId: gameId,
        syncStatus: syncStatus.toStorageString(),
      );

      return syncStatus == SyncStatus.failed
          ? UploadFinishedGameOutcome.failed
          : UploadFinishedGameOutcome.pending;
    } catch (_) {
      await _gameLocalDatasource.updateSyncMetadata(
        gameId: gameId,
        syncStatus: SyncStatus.pending.toStorageString(),
      );
      return UploadFinishedGameOutcome.pending;
    }
  }

  Future<bool> _hasConnectivity() async {
    final result = await _connectivity.checkConnectivity();
    if (result.contains(ConnectivityResult.none)) {
      return false;
    }
    return true;
  }
}
