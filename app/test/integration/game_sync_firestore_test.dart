@Tags(['firebase', 'integration'])
library;

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/data/datasources/round_local_datasource.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/sync/data/datasources/game_firestore_datasource.dart';
import 'package:la_pocha/features/sync/data/repositories/game_sync_repository_impl.dart';
import 'package:la_pocha/features/sync/domain/repositories/game_sync_repository.dart';
import 'package:la_pocha/firebase_options.dart';
import 'package:uuid/uuid.dart';

const _testEmail = String.fromEnvironment('TEST_FIREBASE_EMAIL');
const _testPassword = String.fromEnvironment('TEST_FIREBASE_PASSWORD');

void main() {
  final hasCredentials = _testEmail.isNotEmpty && _testPassword.isNotEmpty;

  test(
    'uploads finished game with embedded players and rounds subcollection',
    () async {
      if (!hasCredentials) {
        return;
      }

      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      final auth = FirebaseAuth.instance;
      await auth.signInWithEmailAndPassword(
        email: _testEmail,
        password: _testPassword,
      );

      final uid = auth.currentUser!.uid;
      final gameId = 'integration-${const Uuid().v4()}';
      final now = DateTime.now();

      final database = AppDatabase.forTesting();
      addTearDown(database.close);

      final gameLocalDatasource = GameLocalDatasource(database);
      final roundLocalDatasource = RoundLocalDatasource(database);
      final firestoreDatasource = GameFirestoreDatasource(
        FirebaseFirestore.instance,
      );
      final syncRepository = GameSyncRepositoryImpl(
        gameLocalDatasource: gameLocalDatasource,
        roundLocalDatasource: roundLocalDatasource,
        firestoreDatasource: firestoreDatasource,
      );

      final players = List.generate(
        4,
        (index) => PlayerEmbed(
          id: 'player-$index',
          displayName: 'Player $index',
          isGuest: index.isOdd,
          userId: index.isEven ? uid : null,
          seatOrder: index,
          totalScore: 10 - index,
          joinedAt: now,
        ),
      );

      final game = Game(
        id: gameId,
        status: GameStatus.finished,
        playerCount: 4,
        totalCards: 40,
        maxCardsPerRound: 10,
        roundSequence: const [
          RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
          RoundDefinition(roundNumber: 2, cardsPerPlayer: 5),
        ],
        players: players,
        firstDealerPlayerId: 'player-0',
        startedAt: now.subtract(const Duration(hours: 1)),
        currentRoundNumber: 2,
        finishedAt: now,
        createdAt: now.subtract(const Duration(hours: 2)),
        updatedAt: now,
      );

      await gameLocalDatasource.insertGame(game);

      for (final roundNumber in [1, 2]) {
        await roundLocalDatasource.insertRound(
          Round(
            id: 'round-$roundNumber',
            gameId: gameId,
            roundNumber: roundNumber,
            cardsInRound: roundNumber == 1 ? 4 : 5,
            dealerPlayerId: 'player-0',
            status: RoundStatus.closed,
            bids: {
              for (final player in players) player.id: 1,
            },
            tricks: {
              for (final player in players) player.id: 1,
            },
            scoresDelta: {
              for (final player in players) player.id: 2,
            },
            createdAt: now,
            closedAt: now,
          ),
        );
      }

      final uploadResult = await syncRepository.uploadFinishedGame(
        gameId: gameId,
        hostId: uid,
      );

      expect(uploadResult, GameUploadResult.synced);

      final gameDoc = await FirebaseFirestore.instance
          .collection('games')
          .doc(gameId)
          .get();

      expect(gameDoc.exists, isTrue);
      expect(gameDoc.data()?['hostId'], uid);
      expect(gameDoc.data()?['status'], 'finished');
      expect(gameDoc.data()?['players'], hasLength(4));
      expect(gameDoc.data()?['participantIds'], contains(uid));

      final roundsSnapshot = await FirebaseFirestore.instance
          .collection('games')
          .doc(gameId)
          .collection('rounds')
          .orderBy('roundNumber')
          .get();

      expect(roundsSnapshot.docs, hasLength(2));
      expect(roundsSnapshot.docs.first.data()['status'], 'closed');

      final localGame = await gameLocalDatasource.getGameById(gameId);
      expect(localGame?.cloudGameId, gameId);
      expect(localGame?.syncStatus?.name, 'synced');

      final batch = FirebaseFirestore.instance.batch();
      for (final roundDoc in roundsSnapshot.docs) {
        batch.delete(roundDoc.reference);
      }
      batch.delete(gameDoc.reference);
      await batch.commit();

      await auth.signOut();
    },
    skip: hasCredentials ? false : 'Set TEST_FIREBASE_EMAIL and TEST_FIREBASE_PASSWORD',
  );
}
