import 'package:drift/drift.dart';

@DataClassName('FavoriteEntry')
class Favorites extends Table {
  TextColumn get id => text()();

  TextColumn get displayName => text()();

  TextColumn get userId => text().nullable()();

  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column<Object>> get primaryKey => {id};
}
