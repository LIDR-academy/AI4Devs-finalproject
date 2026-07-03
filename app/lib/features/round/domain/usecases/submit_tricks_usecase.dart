import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/round/domain/services/score_calculator_service.dart';
import 'package:la_pocha/features/round/domain/services/tricks_sum_validator.dart';

class SubmitTricksUseCase {
  SubmitTricksUseCase([
    ScoreCalculatorService? scoreCalculator,
    TricksSumValidator? validator,
  ])  : _scoreCalculator = scoreCalculator ?? const ScoreCalculatorService(),
        _validator = validator ?? const TricksSumValidator();

  final ScoreCalculatorService _scoreCalculator;
  final TricksSumValidator _validator;

  Map<String, int> previewScoresDelta({
    required Round round,
    required Map<String, int> tricks,
    required List<String> playerIds,
  }) {
    final scores = <String, int>{};
    for (final playerId in playerIds) {
      final trick = tricks[playerId];
      if (trick == null ||
          !_validator.isTrickInRange(
            trick: trick,
            cardsInRound: round.cardsInRound,
          )) {
        continue;
      }
      final bid = round.bids[playerId];
      if (bid == null) {
        continue;
      }
      scores[playerId] = _scoreCalculator.calculateRoundScore(
        bid: bid,
        tricks: trick,
      );
    }
    return scores;
  }

  Map<String, int> call({
    required Round round,
    required Map<String, int> tricks,
    required List<String> playerIds,
  }) {
    if (!_validator.canClose(
      cardsInRound: round.cardsInRound,
      tricks: tricks,
      playerIds: playerIds,
    )) {
      throw StateError('Tricks cannot be submitted yet');
    }

    return {
      for (final playerId in playerIds)
        playerId: _scoreCalculator.calculateRoundScore(
          bid: round.bids[playerId]!,
          tricks: tricks[playerId]!,
        ),
    };
  }
}
