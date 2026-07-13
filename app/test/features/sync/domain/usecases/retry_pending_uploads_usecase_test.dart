import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/sync/domain/entities/sync_status.dart';
import 'package:la_pocha/features/sync/domain/repositories/game_sync_repository.dart';
import 'package:la_pocha/features/sync/domain/usecases/retry_pending_uploads_usecase.dart';
import 'package:la_pocha/features/sync/domain/usecases/upload_finished_game_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'retry_pending_uploads_usecase_test.mocks.dart';

@GenerateMocks([GameSyncRepository, UploadFinishedGameUseCase])
void main() {
  late MockGameSyncRepository gameSyncRepository;
  late MockUploadFinishedGameUseCase uploadFinishedGame;
  late RetryPendingUploadsUseCase useCase;

  final now = DateTime(2026, 3, 15, 20);

  Game pendingGame(String id) {
    return Game(
      id: id,
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
      syncStatus: SyncStatus.pending,
      createdAt: now,
      updatedAt: now,
    );
  }

  setUp(() {
    gameSyncRepository = MockGameSyncRepository();
    uploadFinishedGame = MockUploadFinishedGameUseCase();
    useCase = RetryPendingUploadsUseCase(
      gameSyncRepository: gameSyncRepository,
      uploadFinishedGame: uploadFinishedGame,
    );
  });

  test('retries only pending games and counts synced uploads', () async {
    when(gameSyncRepository.getPendingGames()).thenAnswer(
      (_) async => [pendingGame('game-1'), pendingGame('game-2')],
    );
    when(uploadFinishedGame(gameId: 'game-1'))
        .thenAnswer((_) async => UploadFinishedGameOutcome.synced);
    when(uploadFinishedGame(gameId: 'game-2'))
        .thenAnswer((_) async => UploadFinishedGameOutcome.pending);

    final syncedCount = await useCase();

    expect(syncedCount, 1);
    verify(uploadFinishedGame(gameId: 'game-1')).called(1);
    verify(uploadFinishedGame(gameId: 'game-2')).called(1);
  });
}
