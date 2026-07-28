import 'package:flutter/foundation.dart';
import 'package:la_pocha/core/config/debug_config.dart';

/// Runtime debug configuration for short-game testing.
///
/// Mutable counterpart to the compile-time flags in [debug_config.dart].
/// Only meaningful when [kDebugMode] is true.
class DebugConfigNotifier extends ChangeNotifier {
  bool shortGameMode = false;
  List<int> shortRoundSequence = List<int>.from(kShortRoundSequence);

  void toggleShortGameMode(bool value) {
    shortGameMode = value;
    notifyListeners();
  }

  void updateSequence(List<int> sequence) {
    shortRoundSequence = List<int>.from(sequence);
    notifyListeners();
  }

  /// Parses a comma-separated list of positive integers.
  ///
  /// Returns `null` when the format is invalid (empty, non-numeric tokens,
  /// fewer than 1 or more than 22 values).
  static List<int>? parseRoundSequence(String text) {
    final trimmed = text.trim();
    if (trimmed.isEmpty) {
      return null;
    }

    final parts = trimmed.split(',');
    if (parts.isEmpty || parts.length > 22) {
      return null;
    }

    final values = <int>[];
    for (final part in parts) {
      final token = part.trim();
      if (token.isEmpty) {
        return null;
      }
      final value = int.tryParse(token);
      if (value == null || value < 1) {
        return null;
      }
      values.add(value);
    }

    if (values.isEmpty) {
      return null;
    }

    return values;
  }
}
