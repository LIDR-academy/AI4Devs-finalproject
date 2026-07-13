import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/services/dealer_restriction_validator.dart';

class CloseBiddingUseCase {
  CloseBiddingUseCase(
    this._roundRepository, {
    DealerRestrictionValidator? validator,
  }) : _validator = validator ?? const DealerRestrictionValidator();

  final RoundRepository _roundRepository;
  final DealerRestrictionValidator _validator;

  Future<Round> call({
    required Round round,
    required List<String> playerIds,
  }) async {
    if (round.status != RoundStatus.bidding) {
      throw StateError('Round is not in bidding status');
    }

    if (!_validator.canClose(
      cardsInRound: round.cardsInRound,
      bids: round.bids,
      playerIds: playerIds,
    )) {
      throw StateError('Bidding cannot be closed yet');
    }

    return _roundRepository.updateRound(
      round.copyWith(status: RoundStatus.playing),
    );
  }
}
