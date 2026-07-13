import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/entities/submit_bid_result.dart';
import 'package:la_pocha/features/round/domain/services/dealer_restriction_validator.dart';

class SubmitBidUseCase {
  SubmitBidUseCase(
    this._roundRepository, {
    DealerRestrictionValidator? validator,
  }) : _validator = validator ?? const DealerRestrictionValidator();

  final RoundRepository _roundRepository;
  final DealerRestrictionValidator _validator;

  Future<SubmitBidResult> call({
    required Round round,
    required List<String> biddingOrder,
    required String currentPlayerId,
    required int bid,
  }) async {
    if (!biddingOrder.contains(currentPlayerId)) {
      throw ArgumentError('Player is not in bidding order: $currentPlayerId');
    }

    if (round.bids.containsKey(currentPlayerId)) {
      throw StateError('Player has already submitted a bid: $currentPlayerId');
    }

    final expectedPlayerId = _expectedCurrentPlayerId(
      biddingOrder: biddingOrder,
      bids: round.bids,
    );
    if (expectedPlayerId != currentPlayerId) {
      throw StateError('It is not $currentPlayerId turn to bid');
    }

    if (bid < 0 || bid > round.cardsInRound) {
      throw ArgumentError(
        'Bid must be between 0 and ${round.cardsInRound}, got $bid',
      );
    }

    if (currentPlayerId == round.dealerPlayerId) {
      final forbiddenBid = _validator.forbiddenBidForDealer(
        cardsInRound: round.cardsInRound,
        bidsBeforeDealer: round.bids,
      );
      if (_validator.isForbiddenBid(bid: bid, forbiddenBid: forbiddenBid)) {
        throw StateError(
          'Dealer cannot bid $bid because the total would equal '
          '${round.cardsInRound} tricks',
        );
      }
    }

    final updatedBids = Map<String, int>.from(round.bids)
      ..[currentPlayerId] = bid;
    final updatedRound = await _roundRepository.updateRound(
      round.copyWith(bids: updatedBids),
    );

    return SubmitBidResult(
      round: updatedRound,
      biddingOrder: biddingOrder,
      currentPlayerId: _expectedCurrentPlayerId(
        biddingOrder: biddingOrder,
        bids: updatedRound.bids,
      ),
    );
  }

  String? _expectedCurrentPlayerId({
    required List<String> biddingOrder,
    required Map<String, int> bids,
  }) {
    for (final playerId in biddingOrder) {
      if (!bids.containsKey(playerId)) {
        return playerId;
      }
    }
    return null;
  }
}
