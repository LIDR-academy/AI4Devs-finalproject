import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/services/game_cloner_service.dart';
import 'package:la_pocha/features/history/domain/entities/game_detail.dart';
import 'package:la_pocha/features/history/domain/entities/game_history_source.dart';
import 'package:la_pocha/features/history/domain/usecases/get_game_detail_usecase.dart';
import 'package:la_pocha/features/history/domain/usecases/repeat_game_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'repeat_game_usecase_test.mocks.dart';

@GenerateNiceMocks([
  MockSpec<GetGameDetailUseCase>(),
  MockSpec<GameRepository>(),
  MockSpec<GameClonerService>(),
])
void main() {
  late MockGetGameDetailUseCase getGameDetail;
  late MockGameRepository gameRepository;
  late MockGameClonerService gameCloner;
  late RepeatGameUseCase useCase;

  final sourceGame = Game(
    id: 'source-game',
    status: GameStatus.finished,
    playerCount: 3,
    totalCards: 40,
    maxCardsPerRound: 13,
    roundSequence: const [
      RoundDefinition(roundNumber: 1, cardsPerPlayer: 1),
    ],
    players: [
      PlayerEmbed(
        id: 'player-1',
        displayName: 'Ana',
        isGuest: true,
        userId: null,
        seatOrder: 0,
        totalScore: 10,
        joinedAt: DateTime(2026, 7, 4),
      ),
    ],
    finishedAt: DateTime(2026, 7, 4),
    createdAt: DateTime(2026, 7, 4),
    updatedAt: DateTime(2026, 7, 4),
  );

  final clonedGame = Game(
    id: 'new-game',
    status: GameStatus.setup,
    playerCount: 3,
    totalCards: 40,
    maxCardsPerRound: 13,
    roundSequence: sourceGame.roundSequence,
    players: const [],
    createdAt: DateTime(2026, 7, 13),
    updatedAt: DateTime(2026, 7, 13),
  );

  setUp(() {
    getGameDetail = MockGetGameDetailUseCase();
    gameRepository = MockGameRepository();
    gameCloner = MockGameClonerService();
    useCase = RepeatGameUseCase(
      getGameDetail,
      gameRepository,
      gameCloner,
    );
  });

  test('loads finished game, clones config and saves draft', () async {
    when(
      getGameDetail(
        gameId: 'source-game',
        source: GameHistorySource.local,
      ),
    ).thenAnswer(
      (_) async => GameDetail(
        game: sourceGame,
        roundSummaries: const [],
        finalRanking: const [],
        source: GameHistorySource.local,
      ),
    );
    when(
      gameCloner.cloneForRepeat(
        source: sourceGame,
        newGameId: anyNamed('newGameId'),
        now: anyNamed('now'),
        generatePlayerId: anyNamed('generatePlayerId'),
      ),
    ).thenReturn(clonedGame);
    when(gameRepository.saveDraft(clonedGame)).thenAnswer((_) async => clonedGame);

    final newGameId = await useCase(
      sourceGameId: 'source-game',
      source: GameHistorySource.local,
    );

    expect(newGameId, 'new-game');
    verify(
      getGameDetail(
        gameId: 'source-game',
        source: GameHistorySource.local,
      ),
    ).called(1);
    verify(gameRepository.saveDraft(clonedGame)).called(1);
  });
}
