import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/services/game_detail_mapper.dart';

void main() {
  const mapper = GameDetailMapper();

  final players = [
    PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 1,
      totalScore: 30,
      joinedAt: DateTime(2026),
    ),
    PlayerEmbed(
      id: 'p2',
      displayName: 'Carlos',
      isGuest: true,
      userId: null,
      seatOrder: 2,
      totalScore: 25,
      joinedAt: DateTime(2026),
    ),
  ];

  final game = Game(
    id: 'game-1',
    status: GameStatus.finished,
    playerCount: 2,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [
      RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
      RoundDefinition(roundNumber: 2, cardsPerPlayer: 5),
    ],
    players: players,
    startedAt: DateTime(2026, 7, 4, 20, 0),
    finishedAt: DateTime(2026, 7, 4, 22, 30),
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  final round1 = Round(
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

  final round2 = Round(
    id: 'round-2',
    gameId: 'game-1',
    roundNumber: 2,
    cardsInRound: 5,
    dealerPlayerId: 'p2',
    status: RoundStatus.closed,
    bids: const {'p1': 3, 'p2': 2},
    tricks: const {'p1': 3, 'p2': 2},
    scoresDelta: const {'p1': 20, 'p2': 20},
    createdAt: DateTime(2026),
    closedAt: DateTime(2026),
  );

  group('GameDetailMapper', () {
    test('buildRoundSummaries orders rounds ascending and accumulates ranking', () {
      final summaries = mapper.buildRoundSummaries(
        game: game,
        rounds: [round2, round1],
      );

      expect(summaries, hasLength(2));
      expect(summaries[0].round.roundNumber, 1);
      expect(summaries[1].round.roundNumber, 2);
      expect(summaries[0].dealerDisplayName, 'Ana');
      expect(summaries[1].dealerDisplayName, 'Carlos');

      expect(summaries[0].cumulativeRanking.first.player.displayName, 'Ana');
      expect(summaries[0].cumulativeRanking.first.totalScore, 10);
      expect(summaries[1].cumulativeRanking.first.totalScore, 30);
      expect(summaries[1].cumulativeRanking.last.totalScore, 25);
    });

    test('buildFinalRanking uses last round scores', () {
      final ranking = mapper.buildFinalRanking(
        game: game,
        rounds: [round1, round2],
      );

      expect(ranking.first.player.displayName, 'Ana');
      expect(ranking.first.totalScore, 30);
      expect(ranking.first.roundScore, 20);
      expect(ranking.last.totalScore, 25);
    });

    test('buildGameDetail includes duration and source', () {
      final detail = mapper.buildGameDetail(
        game: game,
        rounds: [round1, round2],
        source: GameHistorySource.local,
      );

      expect(detail.source, GameHistorySource.local);
      expect(detail.duration, const Duration(hours: 2, minutes: 30));
      expect(detail.roundSummaries, hasLength(2));
      expect(detail.finalRanking.first.totalScore, 30);
    });

    test('throws when round is not closed', () {
      expect(
        () => mapper.buildRoundSummaries(
          game: game,
          rounds: [round1.copyWith(status: RoundStatus.bidding)],
        ),
        throwsStateError,
      );
    });
  });
}
