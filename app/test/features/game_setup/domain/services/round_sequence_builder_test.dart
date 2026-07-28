import 'package:la_pocha/core/config/debug_config_notifier.dart';
import 'package:la_pocha/features/game_setup/domain/services/round_sequence_builder.dart';
import 'package:la_pocha/features/game_setup/domain/value_objects/game_deck_config.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const expectedRoundsByPlayerCount = {
    3: 21,
    4: 22,
    5: 19,
    6: 20,
    7: 19,
    8: 18,
  };

  group('buildRoundSequence', () {
    for (final entry in expectedRoundsByPlayerCount.entries) {
      final playerCount = entry.key;
      final expectedRounds = entry.value;

      test('playerCount $playerCount produces $expectedRounds rounds', () {
        final config = GameDeckConfig.fromPlayerCount(playerCount);
        final sequence = buildRoundSequence(
          maxCardsPerRound: config.maxCardsPerRound,
          playerCount: playerCount,
        );

        expect(sequence.length, expectedRounds);
        expect(sequence.first.cardsPerPlayer, 1);
        expect(sequence.last.cardsPerPlayer, 1);
        expect(
          sequence.where((round) => round.cardsPerPlayer == config.maxCardsPerRound).length,
          playerCount,
        );
      });
    }

    test('4 players matches readme example sequence', () {
      final sequence = buildRoundSequence(
        maxCardsPerRound: 10,
        playerCount: 4,
      );

      expect(sequence.length, 22);
      expect(
        sequence.map((round) => round.cardsPerPlayer).toList(),
        [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
          10, 10, 10,
          9, 8, 7, 6, 5, 4, 3, 2, 1,
        ],
      );
      expect(sequence.first.roundNumber, 1);
      expect(sequence.last.roundNumber, 22);
    });

    test('uses short sequence when debug short game mode is enabled', () {
      final debugConfig = DebugConfigNotifier()
        ..toggleShortGameMode(true)
        ..updateSequence([1, 3, 1]);

      final sequence = buildRoundSequence(
        maxCardsPerRound: 10,
        playerCount: 4,
        debugConfig: debugConfig,
      );

      expect(
        sequence.map((round) => round.cardsPerPlayer).toList(),
        [1, 3, 1],
      );
      expect(sequence.map((round) => round.roundNumber).toList(), [1, 2, 3]);
    });

    test('ignores debug config when short game mode is disabled', () {
      final debugConfig = DebugConfigNotifier()
        ..updateSequence([1, 3, 1]);

      final sequence = buildRoundSequence(
        maxCardsPerRound: 10,
        playerCount: 4,
        debugConfig: debugConfig,
      );

      expect(sequence.length, 22);
    });
  });
}
