import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/start_game_result.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';

class GameRepositoryImpl implements GameRepository {
  GameRepositoryImpl(this._localDatasource);

  final GameLocalDatasource _localDatasource;

  @override
  Future<Game> saveDraft(Game game) => _localDatasource.insertGame(game);

  @override
  Future<Game?> getGameById(String id) => _localDatasource.getGameById(id);

  @override
  Future<Game> updateGamePlayers(
    String gameId,
    List<PlayerEmbed> players,
  ) =>
      _localDatasource.updateGamePlayers(gameId, players);

  @override
  Future<Round> closeRoundAndUpdateScores({
    required Round closedRound,
    required List<PlayerEmbed> updatedPlayers,
  }) =>
      _localDatasource.closeRoundAndUpdateScores(
        closedRound: closedRound,
        updatedPlayers: updatedPlayers,
      );

  @override
  Future<StartGameResult> startGame({
    required String gameId,
    required List<PlayerEmbed> players,
    required String firstDealerPlayerId,
    required Round firstRound,
  }) =>
      _localDatasource.startGame(
        gameId: gameId,
        players: players,
        firstDealerPlayerId: firstDealerPlayerId,
        firstRound: firstRound,
      );

  @override
  Future<Round> advanceToNextRound({
    required Round nextRound,
    required int nextRoundNumber,
  }) =>
      _localDatasource.advanceToNextRound(
        nextRound: nextRound,
        nextRoundNumber: nextRoundNumber,
      );

  @override
  Future<Game> finishGame({
    required String gameId,
    required DateTime finishedAt,
  }) =>
      _localDatasource.finishGame(
        gameId: gameId,
        finishedAt: finishedAt,
      );

  @override
  Future<void> deleteGame(String gameId) =>
      _localDatasource.deleteGame(gameId);
}
