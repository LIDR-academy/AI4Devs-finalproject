class StartGameResult {
  const StartGameResult({
    required this.gameId,
    required this.roundId,
    required this.roundNumber,
  });

  final String gameId;
  final String roundId;
  final int roundNumber;
}
