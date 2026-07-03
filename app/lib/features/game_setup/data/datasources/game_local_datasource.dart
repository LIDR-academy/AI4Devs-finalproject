import 'package:drift/drift.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/mappers/game_mapper.dart';
import 'package:la_pocha/features/game_setup/data/mappers/round_mapper.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/start_game_result.dart';
import 'package:uuid/uuid.dart';

class GameLocalDatasource {
  GameLocalDatasource(this._database, {Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  final AppDatabase _database;
  final Uuid _uuid;

  Future<Game> insertGame(Game game) async {
    await _database.into(_database.games).insert(GameMapper.toCompanion(game));
    return _readGameById(game.id);
  }

  Future<Game?> getGameById(String id) async {
    final entries = await (_database.select(_database.games)
          ..where((table) => table.id.equals(id)))
        .get();
    if (entries.isEmpty) {
      return null;
    }
    return GameMapper.toDomain(entries.first);
  }

  Future<Game> updateGamePlayers(
    String gameId,
    List<PlayerEmbed> players,
  ) async {
    await (_database.update(_database.games)
          ..where((table) => table.id.equals(gameId)))
        .write(
      GamesCompanion(
        players: Value(players),
        updatedAt: Value(DateTime.now()),
      ),
    );
    return _readGameById(gameId);
  }

  Future<StartGameResult> startGame({
    required String gameId,
    required List<PlayerEmbed> players,
    required String firstDealerPlayerId,
    required Round firstRound,
  }) async {
    final now = DateTime.now();
    final roundId = firstRound.id.isEmpty ? _uuid.v4() : firstRound.id;
    final roundToInsert = firstRound.copyWith(id: roundId);

    await _database.transaction(() async {
      await (_database.update(_database.games)
            ..where((table) => table.id.equals(gameId)))
          .write(
        GamesCompanion(
          status: const Value('in_progress'),
          players: Value(players),
          firstDealerPlayerId: Value(firstDealerPlayerId),
          startedAt: Value(now),
          currentRoundNumber: const Value(1),
          updatedAt: Value(now),
        ),
      );

      await _database.into(_database.rounds).insert(
            RoundMapper.toCompanion(roundToInsert),
          );
    });

    return StartGameResult(
      gameId: gameId,
      roundId: roundId,
      roundNumber: roundToInsert.roundNumber,
    );
  }

  Future<Round> closeRoundAndUpdateScores({
    required Round closedRound,
    required List<PlayerEmbed> updatedPlayers,
  }) async {
    await _database.transaction(() async {
      await (_database.update(_database.games)
            ..where((table) => table.id.equals(closedRound.gameId)))
          .write(
        GamesCompanion(
          players: Value(updatedPlayers),
          updatedAt: Value(DateTime.now()),
        ),
      );

      await _database.update(_database.rounds).replace(
            RoundMapper.toCompanion(closedRound),
          );
    });

    return _readRoundById(closedRound.id);
  }

  Future<Round> _readRoundById(String id) async {
    final entry = await (_database.select(_database.rounds)
          ..where((table) => table.id.equals(id)))
        .getSingle();
    return RoundMapper.toDomain(entry);
  }

  Future<Game> _readGameById(String id) async {
    final entry = await (_database.select(_database.games)
          ..where((table) => table.id.equals(id)))
        .getSingle();
    return GameMapper.toDomain(entry);
  }
}
