import '../entities/round.dart';

abstract class RoundRepository {
  Future<Round> insertRound(Round round);

  Future<Round?> getRoundByGameAndNumber(String gameId, int roundNumber);
}
