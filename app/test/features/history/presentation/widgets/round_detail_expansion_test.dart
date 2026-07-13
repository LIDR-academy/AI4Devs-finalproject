import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/history/domain/entities/round_summary.dart';
import 'package:la_pocha/features/history/presentation/widgets/round_detail_expansion.dart';
import 'package:la_pocha/features/round/domain/entities/ranking_entry.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

void main() {
  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 10,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p2',
      displayName: 'Carlos',
      isGuest: true,
      userId: null,
      seatOrder: 2,
      totalScore: 5,
      joinedAt: DateTime(2026),
    ),
  ];

  final round = Round(
    id: 'round-1',
    gameId: 'game-1',
    roundNumber: 1,
    cardsInRound: 4,
    dealerPlayerId: 'p1',
    status: RoundStatus.closed,
    bids: const {'p1': 2, 'p2': 1},
    tricks: const {'p1': 2, 'p2': 1},
    scoresDelta: const {'p1': 10, 'p2': 5},
    createdAt: DateTime(2026),
    closedAt: DateTime(2026),
  );

  final summary = RoundSummary(
    round: round,
    dealerDisplayName: 'Ana',
    cumulativeRanking: [
      RankingEntry(
        player: players.first,
        rank: 1,
        roundScore: 10,
        totalScore: 10,
        positionDelta: null,
      ),
      RankingEntry(
        player: players.last,
        rank: 2,
        roundScore: 5,
        totalScore: 5,
        positionDelta: null,
      ),
    ],
  );

  testWidgets('shows bids and tricks for each player', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: RoundDetailExpansion(
            summary: summary,
            playersBySeatOrder: [
              (id: 'p1', displayName: 'Ana'),
              (id: 'p2', displayName: 'Carlos'),
            ],
          ),
        ),
      ),
    );

    expect(find.text('APUESTAS Y BAZAS'), findsOneWidget);
    expect(find.text('Ana'), findsNWidgets(2));
    expect(find.text('Carlos'), findsOneWidget);
    expect(find.text('Apuesta'), findsNWidgets(2));
    expect(find.text('Bazas'), findsNWidgets(2));
    expect(find.text('+10'), findsOneWidget);
    expect(find.text('+5'), findsOneWidget);
  });
}
