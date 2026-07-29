import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/config/debug_config_notifier.dart';
import 'package:la_pocha/features/home/presentation/widgets/debug_config_panel.dart';

void main() {
  testWidgets(
    'DebugConfigPanel muestra el TextField cuando shortGameMode se activa',
    (WidgetTester tester) async {
      final notifier = DebugConfigNotifier();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: DebugConfigPanel(debugConfig: notifier),
            ),
          ),
        ),
      );

      expect(find.byType(TextField), findsNothing);

      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();

      expect(notifier.shortGameMode, isTrue);
      expect(find.byType(TextField), findsOneWidget);

      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();

      expect(notifier.shortGameMode, isFalse);
      expect(find.byType(TextField), findsNothing);
    },
  );
}

