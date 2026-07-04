import '../entities/game.dart';
import '../entities/player_embed.dart';
import '../entities/round.dart';
import '../entities/start_game_result.dart';

abstract class GameRepository {
  Future<Game> saveDraft(Game game);

  Future<Game?> getGameById(String id);

  Future<Game> updateGamePlayers(String gameId, List<PlayerEmbed> players);

  Future<StartGameResult> startGame({
    required String gameId,
    required List<PlayerEmbed> players,
    required String firstDealerPlayerId,
    required Round firstRound,
  });

  Future<Round> closeRoundAndUpdateScores({
    required Round closedRound,
    required List<PlayerEmbed> updatedPlayers,
  });

  Future<Round> advanceToNextRound({
    required Round nextRound,
    required int nextRoundNumber,
  });

  Future<Game> finishGame({
    required String gameId,
    required DateTime finishedAt,
  });
}
