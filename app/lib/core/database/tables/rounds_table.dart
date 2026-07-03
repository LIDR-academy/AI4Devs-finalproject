import 'package:drift/drift.dart';

import '../converters/map_string_int_converter.dart';

@DataClassName('RoundEntry')
class Rounds extends Table {
  TextColumn get id => text()();
  TextColumn get gameId => text()();
  IntColumn get roundNumber => integer()();
  IntColumn get cardsInRound => integer()();
  TextColumn get dealerPlayerId => text()();
  TextColumn get status => text()();
  TextColumn get bids => text().map(const MapStringIntConverter())();
  TextColumn get tricks =>
      text().nullable().map(const MapStringIntConverter())();
  TextColumn get scoresDelta =>
      text().nullable().map(const MapStringIntConverter())();
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get closedAt => dateTime().nullable()();

  @override
  Set<Column<Object>> get primaryKey => {id};

  @override
  List<Set<Column>> get uniqueKeys => [{gameId, roundNumber}];
}
