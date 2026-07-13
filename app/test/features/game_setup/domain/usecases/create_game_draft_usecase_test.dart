import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/create_game_draft_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'create_game_draft_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GameRepository>()])
void main() {
  late MockGameRepository repository;
  late CreateGameDraftUseCase useCase;

  setUp(() {
    repository = MockGameRepository();
    useCase = CreateGameDraftUseCase(repository);
  });

  test('rejects player count below 3', () {
    expect(
      () => useCase(playerCount: 2),
      throwsA(isA<ArgumentError>()),
    );
    verifyNever(repository.saveDraft(any));
  });

  test('rejects player count above 8', () {
    expect(
      () => useCase(playerCount: 9),
      throwsA(isA<ArgumentError>()),
    );
    verifyNever(repository.saveDraft(any));
  });

  test('persists setup draft via repository', () async {
    when(repository.saveDraft(any)).thenAnswer((invocation) async {
      return invocation.positionalArguments.first as Game;
    });

    final game = await useCase(playerCount: 4);

    verify(repository.saveDraft(any)).called(1);
    expect(game.status, GameStatus.setup);
    expect(game.playerCount, 4);
    expect(game.totalCards, 40);
    expect(game.maxCardsPerRound, 10);
    expect(game.roundSequence.length, 22);
    expect(game.id, isNotEmpty);
  });
}
