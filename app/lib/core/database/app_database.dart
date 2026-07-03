import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:drift_flutter/drift_flutter.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';

import 'converters/round_sequence_converter.dart';
import 'tables/games_table.dart';

part 'app_database.g.dart';

@DriftDatabase(tables: [Games])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.executor);

  factory AppDatabase.defaults() => AppDatabase(driftDatabase(name: 'la_pocha'));

  factory AppDatabase.forTesting() => AppDatabase(NativeDatabase.memory());

  @override
  int get schemaVersion => 1;
}
