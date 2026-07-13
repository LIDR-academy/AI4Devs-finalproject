class GameDeckConfig {
  const GameDeckConfig({
    required this.playerCount,
    required this.totalCards,
    required this.maxCardsPerRound,
    required this.totalRounds,
  });

  final int playerCount;
  final int totalCards;
  final int maxCardsPerRound;
  final int totalRounds;

  static const Map<int, GameDeckConfig> _configs = {
    3: GameDeckConfig(
      playerCount: 3,
      totalCards: 30,
      maxCardsPerRound: 10,
      totalRounds: 21,
    ),
    4: GameDeckConfig(
      playerCount: 4,
      totalCards: 40,
      maxCardsPerRound: 10,
      totalRounds: 22,
    ),
    5: GameDeckConfig(
      playerCount: 5,
      totalCards: 40,
      maxCardsPerRound: 8,
      totalRounds: 19,
    ),
    6: GameDeckConfig(
      playerCount: 6,
      totalCards: 48,
      maxCardsPerRound: 8,
      totalRounds: 20,
    ),
    7: GameDeckConfig(
      playerCount: 7,
      totalCards: 49,
      maxCardsPerRound: 7,
      totalRounds: 19,
    ),
    8: GameDeckConfig(
      playerCount: 8,
      totalCards: 48,
      maxCardsPerRound: 6,
      totalRounds: 18,
    ),
  };

  factory GameDeckConfig.fromPlayerCount(int playerCount) {
    final config = _configs[playerCount];
    if (config == null) {
      throw ArgumentError.value(
        playerCount,
        'playerCount',
        'Must be between 3 and 8',
      );
    }
    return config;
  }
}
