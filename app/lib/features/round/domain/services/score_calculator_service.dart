class ScoreCalculatorService {
  const ScoreCalculatorService();

  int calculateRoundScore({required int bid, required int tricks}) {
    if (bid == tricks) {
      return 10 + (5 * tricks);
    }
    return -5 * (bid - tricks).abs();
  }
}
