import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/auth/domain/entities/user_profile.dart';
import 'package:la_pocha/features/auth/domain/repositories/auth_repository.dart';
import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/sync/data/datasources/game_firestore_datasource.dart';
import 'package:la_pocha/features/sync/domain/entities/sync_status.dart';
import 'package:la_pocha/features/sync/domain/repositories/game_sync_repository.dart';
import 'package:la_pocha/features/sync/domain/usecases/upload_finished_game_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'upload_finished_game_usecase_test.mocks.dart';

@GenerateMocks([
  AuthRepository,
  GameSyncRepository,
  GameLocalDatasource,
  Connectivity,
])
void main() {
  late MockAuthRepository authRepository;
  late MockGameSyncRepository gameSyncRepository;
  late MockGameLocalDatasource gameLocalDatasource;
  late MockConnectivity connectivity;
  late UploadFinishedGameUseCase useCase;

  final now = DateTime(2026, 3, 15, 20);

  Game finishedGame({SyncStatus? syncStatus, String? cloudGameId}) {
    return Game(
      id: 'game-1',
      status: GameStatus.finished,
      playerCount: 4,
      totalCards: 40,
      maxCardsPerRound: 10,
      roundSequence: const [
        RoundDefinition(roundNumber: 1, cardsPerPlayer: 4),
      ],
      players: [
        PlayerEmbed(
          id: 'p1',
          displayName: 'Ana',
          isGuest: true,
          userId: null,
          seatOrder: 0,
          totalScore: 0,
          joinedAt: now,
        ),
      ],
      finishedAt: now,
      cloudGameId: cloudGameId,
      syncStatus: syncStatus,
      createdAt: now,
      updatedAt: now,
    );
  }

  final user = UserProfile(
    uid: 'uid-1',
    displayName: 'Host',
    email: 'host@test.com',
    createdAt: now,
    updatedAt: now,
  );

  setUp(() {
    authRepository = MockAuthRepository();
    gameSyncRepository = MockGameSyncRepository();
    gameLocalDatasource = MockGameLocalDatasource();
    connectivity = MockConnectivity();
    useCase = UploadFinishedGameUseCase(
      authRepository: authRepository,
      gameSyncRepository: gameSyncRepository,
      gameLocalDatasource: gameLocalDatasource,
      connectivity: connectivity,
    );
  });

  test('returns skippedNoSession when user is not authenticated', () async {
    when(authRepository.getCurrentUser()).thenAnswer((_) async => null);

    final outcome = await useCase(gameId: 'game-1');

    expect(outcome, UploadFinishedGameOutcome.skippedNoSession);
    verifyNever(gameSyncRepository.uploadFinishedGame(
      gameId: anyNamed('gameId'),
      hostId: anyNamed('hostId'),
    ));
  });

  test('returns skippedAlreadySynced when cloudGameId is set', () async {
    when(authRepository.getCurrentUser()).thenAnswer((_) async => user);
    when(gameLocalDatasource.getGameById('game-1'))
        .thenAnswer((_) async => finishedGame(cloudGameId: 'game-1'));

    final outcome = await useCase(gameId: 'game-1');

    expect(outcome, UploadFinishedGameOutcome.skippedAlreadySynced);
    verifyNever(gameSyncRepository.uploadFinishedGame(
      gameId: anyNamed('gameId'),
      hostId: anyNamed('hostId'),
    ));
  });

  test('marks pending when offline', () async {
    when(authRepository.getCurrentUser()).thenAnswer((_) async => user);
    when(gameLocalDatasource.getGameById('game-1'))
        .thenAnswer((_) async => finishedGame(syncStatus: SyncStatus.local));
    when(connectivity.checkConnectivity())
        .thenAnswer((_) async => [ConnectivityResult.none]);
    when(gameLocalDatasource.updateSyncMetadata(
      gameId: 'game-1',
      syncStatus: SyncStatus.pending.toStorageString(),
    )).thenAnswer((_) async => finishedGame(syncStatus: SyncStatus.pending));

    final outcome = await useCase(gameId: 'game-1');

    expect(outcome, UploadFinishedGameOutcome.pending);
    verify(gameLocalDatasource.updateSyncMetadata(
      gameId: 'game-1',
      syncStatus: SyncStatus.pending.toStorageString(),
    )).called(1);
  });

  test('returns synced after successful upload', () async {
    when(authRepository.getCurrentUser()).thenAnswer((_) async => user);
    when(gameLocalDatasource.getGameById('game-1'))
        .thenAnswer((_) async => finishedGame(syncStatus: SyncStatus.local));
    when(connectivity.checkConnectivity())
        .thenAnswer((_) async => [ConnectivityResult.wifi]);
    when(gameSyncRepository.uploadFinishedGame(
      gameId: 'game-1',
      hostId: 'uid-1',
    )).thenAnswer((_) async => GameUploadResult.synced);

    final outcome = await useCase(gameId: 'game-1');

    expect(outcome, UploadFinishedGameOutcome.synced);
  });

  test('marks failed on permission denied', () async {
    when(authRepository.getCurrentUser()).thenAnswer((_) async => user);
    when(gameLocalDatasource.getGameById('game-1'))
        .thenAnswer((_) async => finishedGame(syncStatus: SyncStatus.local));
    when(connectivity.checkConnectivity())
        .thenAnswer((_) async => [ConnectivityResult.wifi]);
    when(gameSyncRepository.uploadFinishedGame(
      gameId: 'game-1',
      hostId: 'uid-1',
    )).thenThrow(
      const GameSyncException(GameSyncFailureType.permissionDenied),
    );
    when(gameLocalDatasource.updateSyncMetadata(
      gameId: 'game-1',
      syncStatus: SyncStatus.failed.toStorageString(),
    )).thenAnswer((_) async => finishedGame(syncStatus: SyncStatus.failed));

    final outcome = await useCase(gameId: 'game-1');

    expect(outcome, UploadFinishedGameOutcome.failed);
  });
}
