import 'package:drift/drift.dart';

import '../converters/players_converter.dart';
import '../converters/round_sequence_converter.dart';

@DataClassName('GameEntry')
class Games extends Table {
  TextColumn get id => text()();
  TextColumn get status => text()();
  IntColumn get playerCount => integer()();
  IntColumn get totalCards => integer()();
  IntColumn get maxCardsPerRound => integer()();
  TextColumn get roundSequence => text().map(const RoundSequenceConverter())();
  TextColumn get players =>
      text().map(const PlayersConverter()).withDefault(const Constant('[]'))();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}
