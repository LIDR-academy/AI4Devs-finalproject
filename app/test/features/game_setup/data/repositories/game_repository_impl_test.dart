import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/data/datasources/game_local_datasource.dart';
import 'package:la_pocha/features/game_setup/data/repositories/game_repository_impl.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/usecases/create_game_draft_usecase.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late AppDatabase database;
  late CreateGameDraftUseCase useCase;

  setUp(() {
    database = AppDatabase.forTesting();
    final datasource = GameLocalDatasource(database);
    final repository = GameRepositoryImpl(datasource);
    useCase = CreateGameDraftUseCase(repository);
  });

  tearDown(() async {
    await database.close();
  });

  test('persists setup draft in drift', () async {
    final game = await useCase(playerCount: 5);

    final stored = await (database.select(database.games)
          ..where((table) => table.id.equals(game.id)))
        .getSingle();

    expect(stored.status, 'setup');
    expect(stored.playerCount, 5);
    expect(stored.totalCards, 40);
    expect(stored.maxCardsPerRound, 8);
    expect(stored.roundSequence.length, 19);
    expect(game.status, GameStatus.setup);
  });
}
