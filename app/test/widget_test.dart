import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/services/round_sequence_builder.dart';

void main() {
  test('round sequence builder smoke test', () {
    final sequence = buildRoundSequence(maxCardsPerRound: 10, playerCount: 4);
    expect(sequence.length, 22);
  });
}
