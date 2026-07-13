import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/history/data/mappers/finished_game_firestore_reader.dart';

void main() {
  final finishedAt = DateTime(2026, 7, 4, 22, 0);

  final gameData = {
    'hostId': 'user-1',
    'status': 'finished',
    'playerCount': 2,
    'deckSize': 40,
    'maxCardsPerRound': 10,
    'roundSequence': [4, 5],
    'players': [
      {
        'id': 'p1',
        'displayName': 'Ana',
        'isGuest': true,
        'seatOrder': 1,
        'totalScore': 30,
        'joinedAt': Timestamp.fromDate(DateTime(2026)),
      },
      {
        'id': 'p2',
        'displayName': 'Carlos',
        'isGuest': true,
        'seatOrder': 2,
        'totalScore': 25,
        'joinedAt': Timestamp.fromDate(DateTime(2026)),
      },
    ],
    'firstDealerPlayerId': 'p1',
    'currentRoundNumber': 2,
    'createdAt': Timestamp.fromDate(DateTime(2026)),
    'finishedAt': Timestamp.fromDate(finishedAt),
    'startedAt': Timestamp.fromDate(DateTime(2026, 7, 4, 20, 0)),
  };

  final roundData = {
    'roundNumber': 1,
    'cardsInRound': 4,
    'dealerPlayerId': 'p1',
    'status': 'closed',
    'bids': {'p1': 2, 'p2': 1},
    'tricks': {'p1': 2, 'p2': 1},
    'scoresDelta': {'p1': 10, 'p2': 5},
    'createdAt': Timestamp.fromDate(DateTime(2026)),
    'closedAt': Timestamp.fromDate(DateTime(2026)),
  };

  group('FinishedGameFirestoreReader', () {
    test('gameFromDocument maps finished game', () {
      final game = FinishedGameFirestoreReader.gameFromDocument(
        gameId: 'cloud-1',
        data: gameData,
      );

      expect(game.id, 'cloud-1');
      expect(game.status, GameStatus.finished);
      expect(game.players, hasLength(2));
      expect(game.roundSequence, hasLength(2));
      expect(game.finishedAt, finishedAt);
    });

    test('roundFromDocument maps closed round', () {
      final round = FinishedGameFirestoreReader.roundFromDocument(
        gameId: 'cloud-1',
        roundId: '1',
        data: roundData,
      );

      expect(round.roundNumber, 1);
      expect(round.status, RoundStatus.closed);
      expect(round.bids['p1'], 2);
      expect(round.tricks?['p2'], 1);
      expect(round.scoresDelta?['p1'], 10);
    });
  });
}
