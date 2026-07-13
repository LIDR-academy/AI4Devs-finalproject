import 'package:la_pocha/features/history/data/datasources/hidden_games_local_datasource.dart';
import 'package:la_pocha/features/history/data/datasources/history_firestore_datasource.dart';
import 'package:la_pocha/features/history/data/datasources/history_local_datasource.dart';
import 'package:la_pocha/features/history/domain/entities/game_detail.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/repositories/history_repository.dart';
import 'package:la_pocha/features/history/domain/services/game_detail_mapper.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';

class HistoryRepositoryImpl implements HistoryRepository {
  HistoryRepositoryImpl(
    this._localDatasource,
    this._firestoreDatasource,
    this._hiddenGamesDatasource,
    this._gameRepository, {
    GameDetailMapper? gameDetailMapper,
  }) : _gameDetailMapper = gameDetailMapper ?? const GameDetailMapper();

  final HistoryLocalDatasource _localDatasource;
  final HistoryFirestoreDatasource _firestoreDatasource;
  final HiddenGamesLocalDatasource _hiddenGamesDatasource;
  final GameRepository _gameRepository;
  final GameDetailMapper _gameDetailMapper;

  @override
  Future<List<GameHistoryItem>> getGameHistory() async {
    final localItems = await _localDatasource.getFinishedGames();
    final cloudItems = await _firestoreDatasource.getFinishedCloudGames();
    final hiddenIds = await _hiddenGamesDatasource.getHiddenGameIds();
    final merged = _mergeAndDeduplicate(localItems, cloudItems);
    return _filterHiddenItems(merged, hiddenIds);
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

  @override
  Future<void> deleteLocalGame(String gameId) async {
    await _gameRepository.deleteGame(gameId);
  }

  @override
  Future<void> hideCloudGame(String gameId) async {
    await _hiddenGamesDatasource.hideGame(gameId);
  }

  List<GameHistoryItem> _filterHiddenItems(
    List<GameHistoryItem> items,
    Set<String> hiddenIds,
  ) {
    if (hiddenIds.isEmpty) {
      return items;
    }

    return items.where((item) {
      if (hiddenIds.contains(item.id)) {
        return false;
      }
      final cloudGameId = item.cloudGameId;
      if (cloudGameId != null && hiddenIds.contains(cloudGameId)) {
        return false;
      }
      return true;
    }).toList();
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
