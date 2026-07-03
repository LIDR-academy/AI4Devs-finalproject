import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/entities/round_play_state.dart';
import 'package:la_pocha/features/round/domain/services/dealer_restriction_validator.dart';

class GetRoundPlayStateUseCase {
  GetRoundPlayStateUseCase(
    this._gameRepository,
    this._roundRepository, {
    DealerRestrictionValidator? validator,
  }) : _validator = validator ?? const DealerRestrictionValidator();

  final GameRepository _gameRepository;
  final RoundRepository _roundRepository;
  final DealerRestrictionValidator _validator;

  Future<RoundPlayState> call({
    required String gameId,
    required int roundNumber,
  }) async {
    final game = await _gameRepository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    if (game.status != GameStatus.inProgress) {
      throw StateError('Game must be in progress to load play state');
    }

    final round = await _roundRepository.getRoundByGameAndNumber(
      gameId,
      roundNumber,
    );
    if (round == null) {
      throw StateError('Round not found: $gameId/$roundNumber');
    }

    if (round.status != RoundStatus.playing) {
      throw StateError('Round is not in playing status');
    }

    final players = List<PlayerEmbed>.from(game.players)
      ..sort((a, b) => a.seatOrder.compareTo(b.seatOrder));

    final bidSum = _validator.partialBidSum(round.bids);
    final restrictionMet = bidSum != round.cardsInRound;

    return RoundPlayState(
      game: game,
      round: round,
      players: players,
      bidSum: bidSum,
      restrictionMet: restrictionMet,
    );
  }
}
