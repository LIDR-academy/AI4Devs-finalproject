import 'package:la_pocha/features/history/data/datasources/history_firestore_datasource.dart';
import 'package:la_pocha/features/history/data/datasources/history_local_datasource.dart';
import 'package:la_pocha/features/history/domain/entities/game_detail.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/repositories/history_repository.dart';
import 'package:la_pocha/features/history/domain/services/game_detail_mapper.dart';

class HistoryRepositoryImpl implements HistoryRepository {
  HistoryRepositoryImpl(
    this._localDatasource,
    this._firestoreDatasource, {
    GameDetailMapper? gameDetailMapper,
  }) : _gameDetailMapper = gameDetailMapper ?? const GameDetailMapper();

  final HistoryLocalDatasource _localDatasource;
  final HistoryFirestoreDatasource _firestoreDatasource;
  final GameDetailMapper _gameDetailMapper;

  @override
  Future<List<GameHistoryItem>> getGameHistory() async {
    final localItems = await _localDatasource.getFinishedGames();
    final cloudItems = await _firestoreDatasource.getFinishedCloudGames();
    return _mergeAndDeduplicate(localItems, cloudItems);
  }

  @override
  Future<GameDetail> getGameDetail({
    required String gameId,
    required GameHistorySource source,
  }) async {
    final data = switch (source) {
      GameHistorySource.local =>
        await _localDatasource.loadFinishedGameDetail(gameId),
      GameHistorySource.cloud =>
        await _firestoreDatasource.loadFinishedGameDetail(gameId),
    };

    return _gameDetailMapper.buildGameDetail(
      game: data.game,
      rounds: data.rounds,
      source: source,
    );
  }

  List<GameHistoryItem> _mergeAndDeduplicate(
    List<GameHistoryItem> localItems,
    List<GameHistoryItem> cloudItems,
  ) {
    final cloudIds = cloudItems.map((item) => item.id).toSet();

    final filteredLocal = localItems.where((item) {
      final cloudGameId = item.cloudGameId;
      if (cloudGameId == null) {
        return true;
      }
      return !cloudIds.contains(cloudGameId);
    }).toList();

    final merged = [...filteredLocal, ...cloudItems]
      ..sort((a, b) => b.finishedAt.compareTo(a.finishedAt));

    return merged;
  }
}
