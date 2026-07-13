import 'package:la_pocha/core/config/debug_config.dart';

import '../entities/round_definition.dart';

List<RoundDefinition> buildRoundSequence({
  required int maxCardsPerRound,
  required int playerCount,
}) {
  if (kShortGameMode) {
    return [
      for (var i = 0; i < kShortRoundSequence.length; i++)
        RoundDefinition(
          roundNumber: i + 1,
          cardsPerPlayer: kShortRoundSequence[i],
        ),
    ];
  }

  final cardsPerRound = <int>[];

  for (var cards = 1; cards <= maxCardsPerRound; cards++) {
    cardsPerRound.add(cards);
  }

  for (var i = 0; i < playerCount - 1; i++) {
    cardsPerRound.add(maxCardsPerRound);
  }

  for (var cards = maxCardsPerRound - 1; cards >= 1; cards--) {
    cardsPerRound.add(cards);
  }

  return [
    for (var i = 0; i < cardsPerRound.length; i++)
      RoundDefinition(
        roundNumber: i + 1,
        cardsPerPlayer: cardsPerRound[i],
      ),
  ];
}
