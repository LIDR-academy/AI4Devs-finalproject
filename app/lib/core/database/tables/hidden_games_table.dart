import 'package:drift/drift.dart';

@DataClassName('HiddenGameEntry')
class HiddenGames extends Table {
  TextColumn get gameId => text()();

  @override
  Set<Column<Object>> get primaryKey => {gameId};
}
