class TricksSumValidator {
  const TricksSumValidator();

  int partialTricksSum(Map<String, int> tricks) {
    return tricks.values.fold(0, (sum, trick) => sum + trick);
  }

  bool isTrickInRange({required int trick, required int cardsInRound}) {
    return trick >= 0 && trick <= cardsInRound;
  }

  bool areAllTricksInRange({
    required int cardsInRound,
    required Map<String, int> tricks,
    required List<String> playerIds,
  }) {
    return playerIds.every(
      (playerId) => isTrickInRange(
        trick: tricks[playerId] ?? -1,
        cardsInRound: cardsInRound,
      ),
    );
  }

  bool canClose({
    required int cardsInRound,
    required Map<String, int> tricks,
    required List<String> playerIds,
  }) {
    if (playerIds.any((playerId) => !tricks.containsKey(playerId))) {
      return false;
    }

    if (!areAllTricksInRange(
      cardsInRound: cardsInRound,
      tricks: tricks,
      playerIds: playerIds,
    )) {
      return false;
    }

    return partialTricksSum(tricks) == cardsInRound;
  }
}
