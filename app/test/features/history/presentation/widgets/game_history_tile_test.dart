import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/theme/app_theme.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_item.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/presentation/widgets/game_history_tile.dart';

void main() {
  final item = GameHistoryItem(
    id: 'game-1',
    source: GameHistorySource.local,
    finishedAt: DateTime(2026, 7, 4, 22, 0),
    playerCount: 4,
    displayLabel: '4 jul 2026, 22:00 — Ana, Carlos',
    winnerName: 'Ana',
    winnerScore: 42,
  );

  testWidgets('renders local badge, display label and winner', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: GameHistoryTile(
            item: item,
            onTap: () {},
          ),
        ),
      ),
    );

    expect(find.text('4 jul 2026, 22:00 — Ana, Carlos'), findsOneWidget);
    expect(find.text('4 jugadores'), findsOneWidget);
    expect(find.text('Ganador: Ana (42 pts)'), findsOneWidget);
    expect(find.text('Local'), findsOneWidget);
    expect(find.byIcon(Icons.smartphone), findsOneWidget);
  });
}
