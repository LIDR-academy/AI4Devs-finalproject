import 'package:drift/drift.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/mappers/game_mapper.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/services/game_history_mapper.dart';

class HistoryLocalDatasource {
  HistoryLocalDatasource(
    this._database, {
    GameHistoryMapper? mapper,
  }) : _mapper = mapper ?? const GameHistoryMapper();

  final AppDatabase _database;
  final GameHistoryMapper _mapper;

  Future<List<GameHistoryItem>> getFinishedGames() async {
    final entries = await (_database.select(_database.games)
          ..where((table) => table.status.equals('finished'))
          ..orderBy([(table) => OrderingTerm.desc(table.finishedAt)]))
        .get();

    return entries
        .map(GameMapper.toDomain)
        .map(_mapper.fromLocalGame)
        .whereType<GameHistoryItem>()
        .toList();
  }
}
