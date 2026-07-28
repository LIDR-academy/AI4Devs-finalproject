import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/config/debug_config_notifier.dart';

void main() {
  late DebugConfigNotifier notifier;

  setUp(() {
    notifier = DebugConfigNotifier();
  });

  group('DebugConfigNotifier', () {
    test('starts with short game mode disabled and default sequence', () {
      expect(notifier.shortGameMode, isFalse);
      expect(notifier.shortRoundSequence, [1, 4, 8, 8, 4, 1]);
    });

    test('toggleShortGameMode updates flag and notifies listeners', () {
      var notified = 0;
      notifier.addListener(() => notified++);

      notifier.toggleShortGameMode(true);

      expect(notifier.shortGameMode, isTrue);
      expect(notified, 1);

      notifier.toggleShortGameMode(false);

      expect(notifier.shortGameMode, isFalse);
      expect(notified, 2);
    });

    test('updateSequence replaces sequence and notifies listeners', () {
      var notified = 0;
      notifier.addListener(() => notified++);

      notifier.updateSequence([1, 2, 3]);

      expect(notifier.shortRoundSequence, [1, 2, 3]);
      expect(notified, 1);
    });
  });

  group('DebugConfigNotifier.parseRoundSequence', () {
    test('parses comma-separated numbers', () {
      expect(
        DebugConfigNotifier.parseRoundSequence('1,4,8,8,4,1'),
        [1, 4, 8, 8, 4, 1],
      );
    });

    test('trims whitespace around values', () {
      expect(
        DebugConfigNotifier.parseRoundSequence(' 1 , 2 , 3 '),
        [1, 2, 3],
      );
    });

    test('returns null for empty input', () {
      expect(DebugConfigNotifier.parseRoundSequence(''), isNull);
      expect(DebugConfigNotifier.parseRoundSequence('   '), isNull);
    });

    test('returns null when more than 22 values', () {
      final input = List.generate(23, (i) => i + 1).join(',');
      expect(DebugConfigNotifier.parseRoundSequence(input), isNull);
    });

    test('returns null for non-numeric tokens', () {
      expect(DebugConfigNotifier.parseRoundSequence('1,a,3'), isNull);
      expect(DebugConfigNotifier.parseRoundSequence('1,,3'), isNull);
    });

    test('accepts a single value', () {
      expect(DebugConfigNotifier.parseRoundSequence('5'), [5]);
    });

    test('accepts exactly 22 values', () {
      final values = List.generate(22, (i) => i + 1);
      expect(
        DebugConfigNotifier.parseRoundSequence(values.join(',')),
        values,
      );
    });
  });
}
