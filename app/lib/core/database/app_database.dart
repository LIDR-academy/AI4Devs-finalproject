import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:drift_flutter/drift_flutter.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';

import 'converters/map_string_int_converter.dart';
import 'converters/players_converter.dart';
import 'converters/round_sequence_converter.dart';
import 'tables/games_table.dart';
import 'tables/rounds_table.dart';

part 'app_database.g.dart';

@DriftDatabase(tables: [Games, Rounds])
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.executor);

  factory AppDatabase.defaults() => AppDatabase(driftDatabase(name: 'la_pocha'));

  factory AppDatabase.forTesting() => AppDatabase(NativeDatabase.memory());

  @override
  int get schemaVersion => 3;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onUpgrade: (migrator, from, to) async {
          if (from < 2) {
            await migrator.database.customStatement(
              "ALTER TABLE games ADD COLUMN players TEXT NOT NULL DEFAULT '[]'",
            );
          }
          if (from < 3) {
            await migrator.database.customStatement(
              'ALTER TABLE games ADD COLUMN first_dealer_player_id TEXT',
            );
            await migrator.database.customStatement(
              'ALTER TABLE games ADD COLUMN started_at DATETIME',
            );
            await migrator.database.customStatement(
              'ALTER TABLE games ADD COLUMN current_round_number INTEGER',
            );
            await migrator.createTable(rounds);
          }
        },
      );
}
