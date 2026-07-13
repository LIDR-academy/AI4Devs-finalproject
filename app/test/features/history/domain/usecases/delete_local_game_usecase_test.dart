import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/history/domain/repositories/history_repository.dart';
import 'package:la_pocha/features/history/domain/usecases/delete_local_game_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'delete_local_game_usecase_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<HistoryRepository>(),
  MockSpec<GameRepository>(),
])
void main() {
  late MockHistoryRepository historyRepository;
  late MockGameRepository gameRepository;
  late DeleteLocalGameUseCase useCase;

  final finishedGame = Game(
    id: 'local-1',
    status: GameStatus.finished,
    playerCount: 4,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [RoundDefinition(roundNumber: 1, cardsPerPlayer: 4)],
    players: [
      PlayerEmbed(
        id: 'p1',
        displayName: 'Ana',
        isGuest: true,
        userId: null,
        seatOrder: 1,
        totalScore: 10,
        joinedAt: DateTime(2026),
      ),
    ],
    finishedAt: DateTime(2026),
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  setUp(() {
    historyRepository = MockHistoryRepository();
    gameRepository = MockGameRepository();
    useCase = DeleteLocalGameUseCase(historyRepository, gameRepository);
  });

  test('deletes local game when finished', () async {
    when(gameRepository.getGameById('local-1'))
        .thenAnswer((_) async => finishedGame);
    when(historyRepository.deleteLocalGame('local-1'))
        .thenAnswer((_) async {});

    await useCase(gameId: 'local-1');

    verify(historyRepository.deleteLocalGame('local-1')).called(1);
    verifyNever(historyRepository.hideCloudGame(any));
  });

  test('also hides cloud game id when local game was synced', () async {
    final syncedGame = finishedGame.copyWith(cloudGameId: 'cloud-1');
    when(gameRepository.getGameById('local-1'))
        .thenAnswer((_) async => syncedGame);
    when(historyRepository.deleteLocalGame('local-1'))
        .thenAnswer((_) async {});
    when(historyRepository.hideCloudGame('cloud-1'))
        .thenAnswer((_) async {});

    await useCase(gameId: 'local-1');

    verify(historyRepository.deleteLocalGame('local-1')).called(1);
    verify(historyRepository.hideCloudGame('cloud-1')).called(1);
  });

  test('rejects non-finished games', () async {
    when(gameRepository.getGameById('local-1')).thenAnswer(
      (_) async => finishedGame.copyWith(status: GameStatus.inProgress),
    );

    await expectLater(
      useCase(gameId: 'local-1'),
      throwsA(isA<StateError>()),
    );

    verifyNever(historyRepository.deleteLocalGame(any));
    verifyNever(historyRepository.hideCloudGame(any));
  });

  test('rejects missing games', () async {
    when(gameRepository.getGameById('local-1')).thenAnswer((_) async => null);

    await expectLater(
      useCase(gameId: 'local-1'),
      throwsA(isA<StateError>()),
    );

    verifyNever(historyRepository.deleteLocalGame(any));
  });
}
