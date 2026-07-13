import 'package:flutter_test/flutter_test.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/history/data/datasources/hidden_games_local_datasource.dart';

void main() {
  late AppDatabase database;
  late HiddenGamesLocalDatasource datasource;

  setUp(() {
    database = AppDatabase.forTesting();
    datasource = HiddenGamesLocalDatasource(database);
  });

  tearDown(() async {
    await database.close();
  });

  test('getHiddenGameIds returns empty set when no games are hidden', () async {
    final ids = await datasource.getHiddenGameIds();

    expect(ids, isEmpty);
  });

  test('hideGame persists game id and ignores duplicates', () async {
    await datasource.hideGame('cloud-1');
    await datasource.hideGame('cloud-1');

    final ids = await datasource.getHiddenGameIds();

    expect(ids, {'cloud-1'});
  });

  test('isHidden returns true only for hidden game ids', () async {
    await datasource.hideGame('cloud-1');

    expect(await datasource.isHidden('cloud-1'), isTrue);
    expect(await datasource.isHidden('cloud-2'), isFalse);
  });
}
