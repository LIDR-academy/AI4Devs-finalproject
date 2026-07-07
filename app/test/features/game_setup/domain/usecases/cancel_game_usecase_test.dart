import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/cancel_game_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'cancel_game_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GameRepository>()])
void main() {
  late MockGameRepository repository;
  late CancelGameUseCase useCase;

  setUp(() {
    repository = MockGameRepository();
    useCase = CancelGameUseCase(repository);
  });

  Game buildGame(GameStatus status) => Game(
        id: 'game-1',
        status: status,
        playerCount: 2,
        totalCards: 40,
        maxCardsPerRound: 10,
        roundSequence: const [],
        players: const [],
        createdAt: DateTime(2026),
        updatedAt: DateTime(2026),
      );

  test('deletes the game when it is in progress', () async {
    when(repository.getGameById('game-1'))
        .thenAnswer((_) async => buildGame(GameStatus.inProgress));
    when(repository.deleteGame('game-1')).thenAnswer((_) async {});

    await useCase(gameId: 'game-1');

    verify(repository.deleteGame('game-1')).called(1);
  });

  test('deletes the game when it is still in setup', () async {
    when(repository.getGameById('game-1'))
        .thenAnswer((_) async => buildGame(GameStatus.setup));
    when(repository.deleteGame('game-1')).thenAnswer((_) async {});

    await useCase(gameId: 'game-1');

    verify(repository.deleteGame('game-1')).called(1);
  });

  test('throws when the game does not exist', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => null);

    expect(
      () => useCase(gameId: 'game-1'),
      throwsA(isA<StateError>()),
    );
    verifyNever(repository.deleteGame(any));
  });

  test('throws and does not delete a finished game', () async {
    when(repository.getGameById('game-1'))
        .thenAnswer((_) async => buildGame(GameStatus.finished));

    expect(
      () => useCase(gameId: 'game-1'),
      throwsA(isA<StateError>()),
    );
    verifyNever(repository.deleteGame(any));
  });
}
