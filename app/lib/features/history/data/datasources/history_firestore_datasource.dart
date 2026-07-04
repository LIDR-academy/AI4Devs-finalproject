import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';

class HistoryFirestoreDatasource {
  /// TODO(LPT-19): Require Firebase Auth session — query games where
  /// `hostId == uid` OR `players` contains `userId` (see firebase-data-access.yml).
  ///
  /// TODO(LPT-20): Deduplicate via `cloudGameId` set on local Game after upload.
  Future<List<GameHistoryItem>> getFinishedCloudGames() async => [];
}
