import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/remove_player_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'remove_player_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GameRepository>()])
void main() {
  late MockGameRepository repository;
  late RemovePlayerUseCase useCase;

  final player = PlayerEmbed(
    id: 'p1',
    displayName: 'Ana',
    isGuest: true,
    userId: null,
    seatOrder: 0,
    totalScore: 0,
    joinedAt: DateTime(2026),
  );

  final baseGame = Game(
    id: 'game-1',
    status: GameStatus.setup,
    playerCount: 4,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [],
    players: [player],
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  setUp(() {
    repository = MockGameRepository();
    useCase = RemovePlayerUseCase(repository);
  });

  test('removes an existing player', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);
    when(repository.updateGamePlayers(any, any)).thenAnswer((invocation) async {
      final players = invocation.positionalArguments[1] as List<PlayerEmbed>;
      return baseGame.copyWith(players: players);
    });

    final game = await useCase(gameId: 'game-1', playerId: 'p1');

    verify(repository.updateGamePlayers('game-1', any)).called(1);
    expect(game!.players, isEmpty);
  });

  test('does not error when player does not exist', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);

    final game = await useCase(gameId: 'game-1', playerId: 'missing');

    verifyNever(repository.updateGamePlayers(any, any));
    expect(game!.players, hasLength(1));
  });

  test('does not error when game does not exist', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => null);

    final game = await useCase(gameId: 'game-1', playerId: 'p1');

    verifyNever(repository.updateGamePlayers(any, any));
    expect(game, isNull);
  });
}
