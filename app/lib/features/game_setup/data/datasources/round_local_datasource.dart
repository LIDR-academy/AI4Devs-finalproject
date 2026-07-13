import 'package:drift/drift.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/mappers/round_mapper.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';

class RoundLocalDatasource {
  RoundLocalDatasource(this._database);

  final AppDatabase _database;

  Future<Round> insertRound(Round round) async {
    await _database.into(_database.rounds).insert(
          RoundMapper.toCompanion(round),
        );
    return _readRoundById(round.id);
  }

  Future<Round?> getRoundByGameAndNumber(String gameId, int roundNumber) async {
    final entries = await (_database.select(_database.rounds)
          ..where(
            (table) =>
                table.gameId.equals(gameId) &
                table.roundNumber.equals(roundNumber),
          ))
        .get();
    if (entries.isEmpty) {
      return null;
    }
    return RoundMapper.toDomain(entries.first);
  }

  Future<Round> updateRound(Round round) async {
    await _database.update(_database.rounds).replace(
          RoundMapper.toCompanion(round),
        );
    return _readRoundById(round.id);
  }

  Future<List<Round>> getRoundsByGameId(String gameId) async {
    final entries = await (_database.select(_database.rounds)
          ..where((table) => table.gameId.equals(gameId))
          ..orderBy([(table) => OrderingTerm.asc(table.roundNumber)]))
        .get();
    return entries.map(RoundMapper.toDomain).toList();
  }

  Future<Round> _readRoundById(String id) async {
    final entry = await (_database.select(_database.rounds)
          ..where((table) => table.id.equals(id)))
        .getSingle();
    return RoundMapper.toDomain(entry);
  }
}
