class DealerRestrictionValidator {
  const DealerRestrictionValidator();

  int partialBidSum(Map<String, int> bids) {
    return bids.values.fold(0, (sum, bid) => sum + bid);
  }

  int availableTricks({
    required int cardsInRound,
    required Map<String, int> bids,
  }) {
    return cardsInRound - partialBidSum(bids);
  }

  int forbiddenBidForDealer({
    required int cardsInRound,
    required Map<String, int> bidsBeforeDealer,
  }) {
    return availableTricks(
      cardsInRound: cardsInRound,
      bids: bidsBeforeDealer,
    );
  }

  bool isForbiddenBid({
    required int bid,
    required int forbiddenBid,
  }) {
    return bid == forbiddenBid;
  }

  bool canClose({
    required int cardsInRound,
    required Map<String, int> bids,
    required List<String> playerIds,
  }) {
    if (playerIds.any((playerId) => !bids.containsKey(playerId))) {
      return false;
    }

    return partialBidSum(bids) != cardsInRound;
  }
}
