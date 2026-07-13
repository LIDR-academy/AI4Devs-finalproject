import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/round/domain/services/tricks_sum_validator.dart';

void main() {
  const validator = TricksSumValidator();

  group('TricksSumValidator', () {
    test('partialTricksSum sums trick values', () {
      expect(
        validator.partialTricksSum(const {'p1': 3, 'p2': 2}),
        5,
      );
    });

    test('canClose is true when sum equals cardsInRound', () {
      expect(
        validator.canClose(
          cardsInRound: 10,
          tricks: const {'p1': 4, 'p2': 3, 'p3': 3},
          playerIds: const ['p1', 'p2', 'p3'],
        ),
        isTrue,
      );
    });

    test('canClose is false when sum differs from cardsInRound', () {
      expect(
        validator.canClose(
          cardsInRound: 10,
          tricks: const {'p1': 4, 'p2': 3, 'p3': 2},
          playerIds: const ['p1', 'p2', 'p3'],
        ),
        isFalse,
      );
    });

    test('canClose is false when not all players have tricks', () {
      expect(
        validator.canClose(
          cardsInRound: 10,
          tricks: const {'p1': 4, 'p2': 3},
          playerIds: const ['p1', 'p2', 'p3'],
        ),
        isFalse,
      );
    });

    test('isTrickInRange validates 0..cardsInRound', () {
      expect(validator.isTrickInRange(trick: 0, cardsInRound: 5), isTrue);
      expect(validator.isTrickInRange(trick: 5, cardsInRound: 5), isTrue);
      expect(validator.isTrickInRange(trick: 6, cardsInRound: 5), isFalse);
      expect(validator.isTrickInRange(trick: -1, cardsInRound: 5), isFalse);
    });

    test('areAllTricksInRange validates every player trick', () {
      expect(
        validator.areAllTricksInRange(
          cardsInRound: 5,
          tricks: const {'p1': 2, 'p2': 3},
          playerIds: const ['p1', 'p2'],
        ),
        isTrue,
      );
      expect(
        validator.areAllTricksInRange(
          cardsInRound: 5,
          tricks: const {'p1': 6, 'p2': 3},
          playerIds: const ['p1', 'p2'],
        ),
        isFalse,
      );
    });
  });
}
