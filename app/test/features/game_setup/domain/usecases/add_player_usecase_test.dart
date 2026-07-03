import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/add_player_usecase.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_test/flutter_test.dart';

import 'add_player_usecase_test.mocks.dart';

@GenerateNiceMocks([MockSpec<GameRepository>()])
void main() {
  late MockGameRepository repository;
  late AddPlayerUseCase useCase;

  final baseGame = Game(
    id: 'game-1',
    status: GameStatus.setup,
    playerCount: 4,
    totalCards: 40,
    maxCardsPerRound: 10,
    roundSequence: const [],
    players: const [],
    createdAt: DateTime(2026),
    updatedAt: DateTime(2026),
  );

  setUp(() {
    repository = MockGameRepository();
    useCase = AddPlayerUseCase(repository);
  });

  test('adds a valid guest player', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);
    when(repository.updateGamePlayers(any, any)).thenAnswer((invocation) async {
      final players = invocation.positionalArguments[1] as List<PlayerEmbed>;
      return baseGame.copyWith(players: players);
    });

    final game = await useCase(gameId: 'game-1', name: 'Ana');

    verify(repository.updateGamePlayers('game-1', any)).called(1);
    expect(game.players, hasLength(1));
    expect(game.players.first.displayName, 'Ana');
    expect(game.players.first.isGuest, isTrue);
    expect(game.players.first.userId, isNull);
    expect(game.players.first.seatOrder, 0);
    expect(game.players.first.totalScore, 0);
  });

  test('rejects empty name', () async {
    when(repository.getGameById('game-1')).thenAnswer((_) async => baseGame);

    expect(
      () => useCase(gameId: 'game-1', name: '   '),
      throwsA(isA<ArgumentError>()),
    );
    verifyNever(repository.updateGamePlayers(any, any));
  });

  test('rejects duplicate name in the same game', () async {
    final existingPlayer = PlayerEmbed(
      id: 'p1',
      displayName: 'Ana',
      isGuest: true,
      userId: null,
      seatOrder: 0,
      totalScore: 0,
      joinedAt: DateTime(2026),
    );
    when(repository.getGameById('game-1')).thenAnswer(
      (_) async => baseGame.copyWith(players: [existingPlayer]),
    );

    expect(
      () => useCase(gameId: 'game-1', name: 'ana'),
      throwsA(isA<ArgumentError>()),
    );
    verifyNever(repository.updateGamePlayers(any, any));
  });

  test('rejects when player count limit is reached', () async {
    final players = List.generate(
      4,
      (index) => PlayerEmbed(
        id: 'p$index',
        displayName: 'Player $index',
        isGuest: true,
        userId: null,
        seatOrder: index,
        totalScore: 0,
        joinedAt: DateTime(2026),
      ),
    );
    when(repository.getGameById('game-1')).thenAnswer(
      (_) async => baseGame.copyWith(players: players),
    );

    expect(
      () => useCase(gameId: 'game-1', name: 'New'),
      throwsA(isA<ArgumentError>()),
    );
    verifyNever(repository.updateGamePlayers(any, any));
  });
}
