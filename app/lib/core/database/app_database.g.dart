// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $GamesTable extends Games with TableInfo<$GamesTable, GameEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $GamesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _playerCountMeta = const VerificationMeta(
    'playerCount',
  );
  @override
  late final GeneratedColumn<int> playerCount = GeneratedColumn<int>(
    'player_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _totalCardsMeta = const VerificationMeta(
    'totalCards',
  );
  @override
  late final GeneratedColumn<int> totalCards = GeneratedColumn<int>(
    'total_cards',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _maxCardsPerRoundMeta = const VerificationMeta(
    'maxCardsPerRound',
  );
  @override
  late final GeneratedColumn<int> maxCardsPerRound = GeneratedColumn<int>(
    'max_cards_per_round',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  @override
  late final GeneratedColumnWithTypeConverter<List<RoundDefinition>, String>
  roundSequence = GeneratedColumn<String>(
    'round_sequence',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  ).withConverter<List<RoundDefinition>>($GamesTable.$converterroundSequence);
  @override
  late final GeneratedColumnWithTypeConverter<List<PlayerEmbed>, String>
  players = GeneratedColumn<String>(
    'players',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
    defaultValue: const Constant('[]'),
  ).withConverter<List<PlayerEmbed>>($GamesTable.$converterplayers);
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _updatedAtMeta = const VerificationMeta(
    'updatedAt',
  );
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
    'updated_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    status,
    playerCount,
    totalCards,
    maxCardsPerRound,
    roundSequence,
    players,
    createdAt,
    updatedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'games';
  @override
  VerificationContext validateIntegrity(
    Insertable<GameEntry> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('player_count')) {
      context.handle(
        _playerCountMeta,
        playerCount.isAcceptableOrUnknown(
          data['player_count']!,
          _playerCountMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_playerCountMeta);
    }
    if (data.containsKey('total_cards')) {
      context.handle(
        _totalCardsMeta,
        totalCards.isAcceptableOrUnknown(data['total_cards']!, _totalCardsMeta),
      );
    } else if (isInserting) {
      context.missing(_totalCardsMeta);
    }
    if (data.containsKey('max_cards_per_round')) {
      context.handle(
        _maxCardsPerRoundMeta,
        maxCardsPerRound.isAcceptableOrUnknown(
          data['max_cards_per_round']!,
          _maxCardsPerRoundMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_maxCardsPerRoundMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('updated_at')) {
      context.handle(
        _updatedAtMeta,
        updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta),
      );
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  GameEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return GameEntry(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      playerCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}player_count'],
      )!,
      totalCards: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}total_cards'],
      )!,
      maxCardsPerRound: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}max_cards_per_round'],
      )!,
      roundSequence: $GamesTable.$converterroundSequence.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}round_sequence'],
        )!,
      ),
      players: $GamesTable.$converterplayers.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}players'],
        )!,
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      updatedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}updated_at'],
      )!,
    );
  }

  @override
  $GamesTable createAlias(String alias) {
    return $GamesTable(attachedDatabase, alias);
  }

  static TypeConverter<List<RoundDefinition>, String> $converterroundSequence =
      const RoundSequenceConverter();
  static TypeConverter<List<PlayerEmbed>, String> $converterplayers =
      const PlayersConverter();
}

class GameEntry extends DataClass implements Insertable<GameEntry> {
  final String id;
  final String status;
  final int playerCount;
  final int totalCards;
  final int maxCardsPerRound;
  final List<RoundDefinition> roundSequence;
  final List<PlayerEmbed> players;
  final DateTime createdAt;
  final DateTime updatedAt;
  const GameEntry({
    required this.id,
    required this.status,
    required this.playerCount,
    required this.totalCards,
    required this.maxCardsPerRound,
    required this.roundSequence,
    required this.players,
    required this.createdAt,
    required this.updatedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['status'] = Variable<String>(status);
    map['player_count'] = Variable<int>(playerCount);
    map['total_cards'] = Variable<int>(totalCards);
    map['max_cards_per_round'] = Variable<int>(maxCardsPerRound);
    {
      map['round_sequence'] = Variable<String>(
        $GamesTable.$converterroundSequence.toSql(roundSequence),
      );
    }
    {
      map['players'] = Variable<String>(
        $GamesTable.$converterplayers.toSql(players),
      );
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  GamesCompanion toCompanion(bool nullToAbsent) {
    return GamesCompanion(
      id: Value(id),
      status: Value(status),
      playerCount: Value(playerCount),
      totalCards: Value(totalCards),
      maxCardsPerRound: Value(maxCardsPerRound),
      roundSequence: Value(roundSequence),
      players: Value(players),
      createdAt: Value(createdAt),
      updatedAt: Value(updatedAt),
    );
  }

  factory GameEntry.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return GameEntry(
      id: serializer.fromJson<String>(json['id']),
      status: serializer.fromJson<String>(json['status']),
      playerCount: serializer.fromJson<int>(json['playerCount']),
      totalCards: serializer.fromJson<int>(json['totalCards']),
      maxCardsPerRound: serializer.fromJson<int>(json['maxCardsPerRound']),
      roundSequence: serializer.fromJson<List<RoundDefinition>>(
        json['roundSequence'],
      ),
      players: serializer.fromJson<List<PlayerEmbed>>(json['players']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'status': serializer.toJson<String>(status),
      'playerCount': serializer.toJson<int>(playerCount),
      'totalCards': serializer.toJson<int>(totalCards),
      'maxCardsPerRound': serializer.toJson<int>(maxCardsPerRound),
      'roundSequence': serializer.toJson<List<RoundDefinition>>(roundSequence),
      'players': serializer.toJson<List<PlayerEmbed>>(players),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  GameEntry copyWith({
    String? id,
    String? status,
    int? playerCount,
    int? totalCards,
    int? maxCardsPerRound,
    List<RoundDefinition>? roundSequence,
    List<PlayerEmbed>? players,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) => GameEntry(
    id: id ?? this.id,
    status: status ?? this.status,
    playerCount: playerCount ?? this.playerCount,
    totalCards: totalCards ?? this.totalCards,
    maxCardsPerRound: maxCardsPerRound ?? this.maxCardsPerRound,
    roundSequence: roundSequence ?? this.roundSequence,
    players: players ?? this.players,
    createdAt: createdAt ?? this.createdAt,
    updatedAt: updatedAt ?? this.updatedAt,
  );
  GameEntry copyWithCompanion(GamesCompanion data) {
    return GameEntry(
      id: data.id.present ? data.id.value : this.id,
      status: data.status.present ? data.status.value : this.status,
      playerCount: data.playerCount.present
          ? data.playerCount.value
          : this.playerCount,
      totalCards: data.totalCards.present
          ? data.totalCards.value
          : this.totalCards,
      maxCardsPerRound: data.maxCardsPerRound.present
          ? data.maxCardsPerRound.value
          : this.maxCardsPerRound,
      roundSequence: data.roundSequence.present
          ? data.roundSequence.value
          : this.roundSequence,
      players: data.players.present ? data.players.value : this.players,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('GameEntry(')
          ..write('id: $id, ')
          ..write('status: $status, ')
          ..write('playerCount: $playerCount, ')
          ..write('totalCards: $totalCards, ')
          ..write('maxCardsPerRound: $maxCardsPerRound, ')
          ..write('roundSequence: $roundSequence, ')
          ..write('players: $players, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    status,
    playerCount,
    totalCards,
    maxCardsPerRound,
    roundSequence,
    players,
    createdAt,
    updatedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is GameEntry &&
          other.id == this.id &&
          other.status == this.status &&
          other.playerCount == this.playerCount &&
          other.totalCards == this.totalCards &&
          other.maxCardsPerRound == this.maxCardsPerRound &&
          other.roundSequence == this.roundSequence &&
          other.players == this.players &&
          other.createdAt == this.createdAt &&
          other.updatedAt == this.updatedAt);
}

class GamesCompanion extends UpdateCompanion<GameEntry> {
  final Value<String> id;
  final Value<String> status;
  final Value<int> playerCount;
  final Value<int> totalCards;
  final Value<int> maxCardsPerRound;
  final Value<List<RoundDefinition>> roundSequence;
  final Value<List<PlayerEmbed>> players;
  final Value<DateTime> createdAt;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const GamesCompanion({
    this.id = const Value.absent(),
    this.status = const Value.absent(),
    this.playerCount = const Value.absent(),
    this.totalCards = const Value.absent(),
    this.maxCardsPerRound = const Value.absent(),
    this.roundSequence = const Value.absent(),
    this.players = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  GamesCompanion.insert({
    required String id,
    required String status,
    required int playerCount,
    required int totalCards,
    required int maxCardsPerRound,
    required List<RoundDefinition> roundSequence,
    this.players = const Value.absent(),
    required DateTime createdAt,
    required DateTime updatedAt,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       status = Value(status),
       playerCount = Value(playerCount),
       totalCards = Value(totalCards),
       maxCardsPerRound = Value(maxCardsPerRound),
       roundSequence = Value(roundSequence),
       createdAt = Value(createdAt),
       updatedAt = Value(updatedAt);
  static Insertable<GameEntry> custom({
    Expression<String>? id,
    Expression<String>? status,
    Expression<int>? playerCount,
    Expression<int>? totalCards,
    Expression<int>? maxCardsPerRound,
    Expression<String>? roundSequence,
    Expression<String>? players,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (status != null) 'status': status,
      if (playerCount != null) 'player_count': playerCount,
      if (totalCards != null) 'total_cards': totalCards,
      if (maxCardsPerRound != null) 'max_cards_per_round': maxCardsPerRound,
      if (roundSequence != null) 'round_sequence': roundSequence,
      if (players != null) 'players': players,
      if (createdAt != null) 'created_at': createdAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  GamesCompanion copyWith({
    Value<String>? id,
    Value<String>? status,
    Value<int>? playerCount,
    Value<int>? totalCards,
    Value<int>? maxCardsPerRound,
    Value<List<RoundDefinition>>? roundSequence,
    Value<List<PlayerEmbed>>? players,
    Value<DateTime>? createdAt,
    Value<DateTime>? updatedAt,
    Value<int>? rowid,
  }) {
    return GamesCompanion(
      id: id ?? this.id,
      status: status ?? this.status,
      playerCount: playerCount ?? this.playerCount,
      totalCards: totalCards ?? this.totalCards,
      maxCardsPerRound: maxCardsPerRound ?? this.maxCardsPerRound,
      roundSequence: roundSequence ?? this.roundSequence,
      players: players ?? this.players,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (playerCount.present) {
      map['player_count'] = Variable<int>(playerCount.value);
    }
    if (totalCards.present) {
      map['total_cards'] = Variable<int>(totalCards.value);
    }
    if (maxCardsPerRound.present) {
      map['max_cards_per_round'] = Variable<int>(maxCardsPerRound.value);
    }
    if (roundSequence.present) {
      map['round_sequence'] = Variable<String>(
        $GamesTable.$converterroundSequence.toSql(roundSequence.value),
      );
    }
    if (players.present) {
      map['players'] = Variable<String>(
        $GamesTable.$converterplayers.toSql(players.value),
      );
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('GamesCompanion(')
          ..write('id: $id, ')
          ..write('status: $status, ')
          ..write('playerCount: $playerCount, ')
          ..write('totalCards: $totalCards, ')
          ..write('maxCardsPerRound: $maxCardsPerRound, ')
          ..write('roundSequence: $roundSequence, ')
          ..write('players: $players, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $GamesTable games = $GamesTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [games];
}

typedef $$GamesTableCreateCompanionBuilder =
    GamesCompanion Function({
      required String id,
      required String status,
      required int playerCount,
      required int totalCards,
      required int maxCardsPerRound,
      required List<RoundDefinition> roundSequence,
      Value<List<PlayerEmbed>> players,
      required DateTime createdAt,
      required DateTime updatedAt,
      Value<int> rowid,
    });
typedef $$GamesTableUpdateCompanionBuilder =
    GamesCompanion Function({
      Value<String> id,
      Value<String> status,
      Value<int> playerCount,
      Value<int> totalCards,
      Value<int> maxCardsPerRound,
      Value<List<RoundDefinition>> roundSequence,
      Value<List<PlayerEmbed>> players,
      Value<DateTime> createdAt,
      Value<DateTime> updatedAt,
      Value<int> rowid,
    });

class $$GamesTableFilterComposer extends Composer<_$AppDatabase, $GamesTable> {
  $$GamesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get playerCount => $composableBuilder(
    column: $table.playerCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get totalCards => $composableBuilder(
    column: $table.totalCards,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get maxCardsPerRound => $composableBuilder(
    column: $table.maxCardsPerRound,
    builder: (column) => ColumnFilters(column),
  );

  ColumnWithTypeConverterFilters<
    List<RoundDefinition>,
    List<RoundDefinition>,
    String
  >
  get roundSequence => $composableBuilder(
    column: $table.roundSequence,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnWithTypeConverterFilters<List<PlayerEmbed>, List<PlayerEmbed>, String>
  get players => $composableBuilder(
    column: $table.players,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$GamesTableOrderingComposer
    extends Composer<_$AppDatabase, $GamesTable> {
  $$GamesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get playerCount => $composableBuilder(
    column: $table.playerCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get totalCards => $composableBuilder(
    column: $table.totalCards,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get maxCardsPerRound => $composableBuilder(
    column: $table.maxCardsPerRound,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get roundSequence => $composableBuilder(
    column: $table.roundSequence,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get players => $composableBuilder(
    column: $table.players,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
    column: $table.updatedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$GamesTableAnnotationComposer
    extends Composer<_$AppDatabase, $GamesTable> {
  $$GamesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get playerCount => $composableBuilder(
    column: $table.playerCount,
    builder: (column) => column,
  );

  GeneratedColumn<int> get totalCards => $composableBuilder(
    column: $table.totalCards,
    builder: (column) => column,
  );

  GeneratedColumn<int> get maxCardsPerRound => $composableBuilder(
    column: $table.maxCardsPerRound,
    builder: (column) => column,
  );

  GeneratedColumnWithTypeConverter<List<RoundDefinition>, String>
  get roundSequence => $composableBuilder(
    column: $table.roundSequence,
    builder: (column) => column,
  );

  GeneratedColumnWithTypeConverter<List<PlayerEmbed>, String> get players =>
      $composableBuilder(column: $table.players, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$GamesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $GamesTable,
          GameEntry,
          $$GamesTableFilterComposer,
          $$GamesTableOrderingComposer,
          $$GamesTableAnnotationComposer,
          $$GamesTableCreateCompanionBuilder,
          $$GamesTableUpdateCompanionBuilder,
          (GameEntry, BaseReferences<_$AppDatabase, $GamesTable, GameEntry>),
          GameEntry,
          PrefetchHooks Function()
        > {
  $$GamesTableTableManager(_$AppDatabase db, $GamesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$GamesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$GamesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$GamesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<int> playerCount = const Value.absent(),
                Value<int> totalCards = const Value.absent(),
                Value<int> maxCardsPerRound = const Value.absent(),
                Value<List<RoundDefinition>> roundSequence =
                    const Value.absent(),
                Value<List<PlayerEmbed>> players = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> updatedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => GamesCompanion(
                id: id,
                status: status,
                playerCount: playerCount,
                totalCards: totalCards,
                maxCardsPerRound: maxCardsPerRound,
                roundSequence: roundSequence,
                players: players,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String status,
                required int playerCount,
                required int totalCards,
                required int maxCardsPerRound,
                required List<RoundDefinition> roundSequence,
                Value<List<PlayerEmbed>> players = const Value.absent(),
                required DateTime createdAt,
                required DateTime updatedAt,
                Value<int> rowid = const Value.absent(),
              }) => GamesCompanion.insert(
                id: id,
                status: status,
                playerCount: playerCount,
                totalCards: totalCards,
                maxCardsPerRound: maxCardsPerRound,
                roundSequence: roundSequence,
                players: players,
                createdAt: createdAt,
                updatedAt: updatedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$GamesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $GamesTable,
      GameEntry,
      $$GamesTableFilterComposer,
      $$GamesTableOrderingComposer,
      $$GamesTableAnnotationComposer,
      $$GamesTableCreateCompanionBuilder,
      $$GamesTableUpdateCompanionBuilder,
      (GameEntry, BaseReferences<_$AppDatabase, $GamesTable, GameEntry>),
      GameEntry,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$GamesTableTableManager get games =>
      $$GamesTableTableManager(_db, _db.games);
}
