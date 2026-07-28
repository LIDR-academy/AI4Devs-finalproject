import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/update_player_name_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'update_player_name_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GameRepository>()])
void main() {
  late MockGameRepository repository;
  late UpdatePlayerNameUseCase useCase;

  final ana = PlayerEmbed(
    id: 'p1',
    displayName: 'Ana',
    isGuest: true,
    userId: null,
    seatOrder: 0,
    totalScore: 0,
    joinedAt: DateTime(2026),
  );

  final bob = PlayerEmbed(
    id: 'p2',
    displayName: 'Bob',
    isGuest: true,
    userId: null,
    seatOrder: 1,
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
    players: [ana, bob],
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  setUp(() {
    repository = MockGameRepository();
    useCase = UpdatePlayerNameUseCase(repository);
  });

  test('updates player display name', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);
    when(repository.updateGamePlayers(any, any)).thenAnswer((invocation) async {
      final players = invocation.positionalArguments[1] as List<PlayerEmbed>;
      return baseGame.copyWith(players: players);
    });

    final game = await useCase(
      gameId: 'game-1',
      playerId: 'p1',
      newName: 'Anita',
    );

    verify(repository.updateGamePlayers('game-1', any)).called(1);
    expect(game.players.firstWhere((p) => p.id == 'p1').displayName, 'Anita');
    expect(game.players.firstWhere((p) => p.id == 'p2').displayName, 'Bob');
  });

  test('returns game without update when name is unchanged', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);

    final game = await useCase(
      gameId: 'game-1',
      playerId: 'p1',
      newName: '  Ana  ',
    );

    verifyNever(repository.updateGamePlayers(any, any));
    expect(game.players, baseGame.players);
  });

  test('rejects empty name', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);

    expect(
      () => useCase(gameId: 'game-1', playerId: 'p1', newName: '   '),
      throwsA(isA<ArgumentError>()),
    );
    verifyNever(repository.updateGamePlayers(any, any));
  });

  test('rejects duplicate name of another player', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);

    expect(
      () => useCase(gameId: 'game-1', playerId: 'p1', newName: 'bob'),
      throwsA(isA<ArgumentError>()),
    );
    verifyNever(repository.updateGamePlayers(any, any));
  });

  test('throws when game is not found', () async {
    when(repository.getGameById('missing')).thenAnswer((_) async => null);

    expect(
      () => useCase(gameId: 'missing', playerId: 'p1', newName: 'Ana'),
      throwsA(isA<StateError>()),
    );
  });

  test('throws when player is not found', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);

    expect(
      () => useCase(gameId: 'game-1', playerId: 'missing', newName: 'Ana'),
      throwsA(isA<StateError>()),
    );
  });
}
