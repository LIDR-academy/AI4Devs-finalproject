import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/round/domain/services/dealer_restriction_validator.dart';

void main() {
  const validator = DealerRestrictionValidator();

  group('DealerRestrictionValidator', () {
    test('partialBidSum sums bid values', () {
      expect(
        validator.partialBidSum(const {'p1': 3, 'p2': 2}),
        5,
      );
    });

    test('availableTricks subtracts partial sum from cardsInRound', () {
      expect(
        validator.availableTricks(
          cardsInRound: 10,
          bids: const {'p1': 3, 'p2': 2},
        ),
        5,
      );
    });

    test('forbiddenBidForDealer equals available tricks before dealer bids', () {
      expect(
        validator.forbiddenBidForDealer(
          cardsInRound: 10,
          bidsBeforeDealer: const {'p1': 3, 'p2': 2},
        ),
        5,
      );
    });

    test('isForbiddenBid returns true when bid equals forbidden value', () {
      expect(validator.isForbiddenBid(bid: 5, forbiddenBid: 5), isTrue);
      expect(validator.isForbiddenBid(bid: 4, forbiddenBid: 5), isFalse);
    });

    test('canClose is false when sum equals cardsInRound', () {
      expect(
        validator.canClose(
          cardsInRound: 10,
          bids: const {'p1': 4, 'p2': 3, 'p3': 3},
          playerIds: const ['p1', 'p2', 'p3'],
        ),
        isFalse,
      );
    });

    test('canClose is true when all bids present and sum differs', () {
      expect(
        validator.canClose(
          cardsInRound: 10,
          bids: const {'p1': 4, 'p2': 3, 'p3': 2},
          playerIds: const ['p1', 'p2', 'p3'],
        ),
        isTrue,
      );
    });

    test('canClose is false when not all players have bid', () {
      expect(
        validator.canClose(
          cardsInRound: 10,
          bids: const {'p1': 4, 'p2': 3},
          playerIds: const ['p1', 'p2', 'p3'],
        ),
        isFalse,
      );
    });

    test('canClose allows sum of zero bids when cardsInRound is positive', () {
      expect(
        validator.canClose(
          cardsInRound: 5,
          bids: const {'p1': 0, 'p2': 0, 'p3': 0},
          playerIds: const ['p1', 'p2', 'p3'],
        ),
        isTrue,
      );
    });

    test('canClose allows maximum bids when sum differs from cardsInRound', () {
      expect(
        validator.canClose(
          cardsInRound: 5,
          bids: const {'p1': 5, 'p2': 5, 'p3': 5},
          playerIds: const ['p1', 'p2', 'p3'],
        ),
        isTrue,
      );
    });
  });
}
