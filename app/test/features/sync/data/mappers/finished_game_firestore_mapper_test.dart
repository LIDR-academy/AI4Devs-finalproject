import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/sync/data/mappers/finished_game_firestore_mapper.dart';

void main() {
  final now = DateTime(2026, 3, 15, 20, 30);

  Game buildFinishedGame({List<PlayerEmbed>? players}) {
    return Game(
      id: 'game-1',
      status: GameStatus.finished,
      playerCount: 4,
      totalCards: 40,
      maxCardsPerRound: 10,
      roundSequence: const [
        RoundDefinition(roundNumber: 1, cardsPerPlayer: 1),
        RoundDefinition(roundNumber: 2, cardsPerPlayer: 2),
      ],
      players: players ??
          [
            PlayerEmbed(
              id: 'p1',
              displayName: 'Ana',
              isGuest: false,
              userId: 'uid-1',
              seatOrder: 0,
              totalScore: 12,
              joinedAt: now,
            ),
            PlayerEmbed(
              id: 'p2',
              displayName: 'Bob',
              isGuest: true,
              userId: null,
              seatOrder: 1,
              totalScore: 8,
              joinedAt: now,
            ),
            PlayerEmbed(
              id: 'p3',
              displayName: 'Carla',
              isGuest: false,
              userId: 'uid-1',
              seatOrder: 2,
              totalScore: 5,
              joinedAt: now,
            ),
            PlayerEmbed(
              id: 'p4',
              displayName: 'Dan',
              isGuest: false,
              userId: 'uid-2',
              seatOrder: 3,
              totalScore: 3,
              joinedAt: now,
            ),
          ],
      firstDealerPlayerId: 'p1',
      startedAt: now.subtract(const Duration(hours: 2)),
      currentRoundNumber: 2,
      finishedAt: now,
      createdAt: now.subtract(const Duration(hours: 3)),
      updatedAt: now,
    );
  }

  Round buildClosedRound(int roundNumber) {
    return Round(
      id: 'round-$roundNumber',
      gameId: 'game-1',
      roundNumber: roundNumber,
      cardsInRound: roundNumber,
      dealerPlayerId: 'p1',
      status: RoundStatus.closed,
      bids: const {'p1': 1, 'p2': 0, 'p3': 0, 'p4': 0},
      tricks: const {'p1': 1, 'p2': 0, 'p3': 0, 'p4': 0},
      scoresDelta: const {'p1': 2, 'p2': -1, 'p3': -1, 'p4': -1},
      createdAt: now,
      closedAt: now,
    );
  }

  group('FinishedGameFirestoreMapper', () {
    test('maps finished game with embedded players and numeric roundSequence', () {
      final game = buildFinishedGame();
      final document = FinishedGameFirestoreMapper.toGameDocument(
        game: game,
        hostId: 'host-uid',
      );

      expect(document['hostId'], 'host-uid');
      expect(document['status'], 'finished');
      expect(document['playerCount'], 4);
      expect(document['deckSize'], 40);
      expect(document['maxCardsPerRound'], 10);
      expect(document['totalRounds'], 2);
      expect(document['roundSequence'], [1, 2]);
      expect(document['participantIds'], ['uid-1', 'uid-2']);
      expect(document['players'], hasLength(4));

      final firstPlayer = document['players'][0] as Map<String, dynamic>;
      expect(firstPlayer['id'], 'p1');
      expect(firstPlayer['displayName'], 'Ana');
      expect(firstPlayer['totalScore'], 12);
    });

    test('maps closed round document', () {
      final round = buildClosedRound(1);
      final document = FinishedGameFirestoreMapper.toRoundDocument(round);

      expect(document['roundNumber'], 1);
      expect(document['status'], 'closed');
      expect(document['bids'], isNotEmpty);
      expect(document['tricks'], isNotEmpty);
      expect(document['scoresDelta'], isNotEmpty);
    });

    test('throws when game is not finished', () {
      final game = buildFinishedGame().copyWith(
        status: GameStatus.inProgress,
        finishedAt: null,
      );

      expect(
        () => FinishedGameFirestoreMapper.toGameDocument(
          game: game,
          hostId: 'host-uid',
        ),
        throwsStateError,
      );
    });
  });
}
