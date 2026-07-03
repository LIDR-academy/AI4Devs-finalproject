import 'package:la_pocha/features/game_setup/data/datasources/round_local_datasource.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';

class RoundRepositoryImpl implements RoundRepository {
  RoundRepositoryImpl(this._localDatasource);

  final RoundLocalDatasource _localDatasource;

  @override
  Future<Round> insertRound(Round round) =>
      _localDatasource.insertRound(round);

  @override
  Future<Round?> getRoundByGameAndNumber(String gameId, int roundNumber) =>
      _localDatasource.getRoundByGameAndNumber(gameId, roundNumber);
}
