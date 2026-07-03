import 'package:bloc_test/bloc_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/create_game_draft_usecase.dart';
import 'package:la_pocha/features/game_setup/presentation/bloc/create_game_bloc.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'create_game_bloc_test.mocks.dart';

@GenerateNiceMocks([MockSpec<CreateGameDraftUseCase>()])
void main() {
  late MockCreateGameDraftUseCase createGameDraft;

  setUp(() {
    createGameDraft = MockCreateGameDraftUseCase();
  });

  CreateGameBloc buildBloc() => CreateGameBloc(createGameDraft: createGameDraft);

  blocTest<CreateGameBloc, CreateGameState>(
    'emits preview when player count changes',
    build: buildBloc,
    act: (bloc) => bloc.add(const PlayerCountChanged(6)),
    expect: () => [
      const CreateGamePreview(
        playerCount: 6,
        totalCards: 48,
        maxCardsPerRound: 8,
        totalRounds: 20,
      ),
    ],
  );

  blocTest<CreateGameBloc, CreateGameState>(
    'emits submitting then success when confirmed',
    build: buildBloc,
    seed: () => const CreateGamePreview(
      playerCount: 4,
      totalCards: 40,
      maxCardsPerRound: 10,
      totalRounds: 22,
    ),
    setUp: () {
      when(createGameDraft(playerCount: 4)).thenAnswer(
        (_) async => Game(
          id: 'game-123',
          status: GameStatus.setup,
          playerCount: 4,
          totalCards: 40,
          maxCardsPerRound: 10,
          roundSequence: const [],
          createdAt: DateTime(2026),
          updatedAt: DateTime(2026),
        ),
      );
    },
    act: (bloc) => bloc.add(const CreateGameConfirmed()),
    expect: () => [
      const CreateGameSubmitting(
        playerCount: 4,
        totalCards: 40,
        maxCardsPerRound: 10,
        totalRounds: 22,
      ),
      const CreateGameSuccess(gameId: 'game-123'),
    ],
  );

  blocTest<CreateGameBloc, CreateGameState>(
    'emits failure when persistence fails',
    build: buildBloc,
    seed: () => const CreateGamePreview(
      playerCount: 4,
      totalCards: 40,
      maxCardsPerRound: 10,
      totalRounds: 22,
    ),
    setUp: () {
      when(createGameDraft(playerCount: 4)).thenThrow(Exception('db error'));
    },
    act: (bloc) => bloc.add(const CreateGameConfirmed()),
    expect: () => [
      const CreateGameSubmitting(
        playerCount: 4,
        totalCards: 40,
        maxCardsPerRound: 10,
        totalRounds: 22,
      ),
      isA<CreateGameFailure>(),
    ],
  );
}
