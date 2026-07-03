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
  static const VerificationMeta _firstDealerPlayerIdMeta =
      const VerificationMeta('firstDealerPlayerId');
  @override
  late final GeneratedColumn<String> firstDealerPlayerId =
      GeneratedColumn<String>(
        'first_dealer_player_id',
        aliasedName,
        true,
        type: DriftSqlType.string,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _startedAtMeta = const VerificationMeta(
    'startedAt',
  );
  @override
  late final GeneratedColumn<DateTime> startedAt = GeneratedColumn<DateTime>(
    'started_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _currentRoundNumberMeta =
      const VerificationMeta('currentRoundNumber');
  @override
  late final GeneratedColumn<int> currentRoundNumber = GeneratedColumn<int>(
    'current_round_number',
    aliasedName,
    true,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
  );
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
    firstDealerPlayerId,
    startedAt,
    currentRoundNumber,
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
    if (data.containsKey('first_dealer_player_id')) {
      context.handle(
        _firstDealerPlayerIdMeta,
        firstDealerPlayerId.isAcceptableOrUnknown(
          data['first_dealer_player_id']!,
          _firstDealerPlayerIdMeta,
        ),
      );
    }
    if (data.containsKey('started_at')) {
      context.handle(
        _startedAtMeta,
        startedAt.isAcceptableOrUnknown(data['started_at']!, _startedAtMeta),
      );
    }
    if (data.containsKey('current_round_number')) {
      context.handle(
        _currentRoundNumberMeta,
        currentRoundNumber.isAcceptableOrUnknown(
          data['current_round_number']!,
          _currentRoundNumberMeta,
        ),
      );
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
      firstDealerPlayerId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}first_dealer_player_id'],
      ),
      startedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}started_at'],
      ),
      currentRoundNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}current_round_number'],
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
  final String? firstDealerPlayerId;
  final DateTime? startedAt;
  final int? currentRoundNumber;
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
    this.firstDealerPlayerId,
    this.startedAt,
    this.currentRoundNumber,
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
    if (!nullToAbsent || firstDealerPlayerId != null) {
      map['first_dealer_player_id'] = Variable<String>(firstDealerPlayerId);
    }
    if (!nullToAbsent || startedAt != null) {
      map['started_at'] = Variable<DateTime>(startedAt);
    }
    if (!nullToAbsent || currentRoundNumber != null) {
      map['current_round_number'] = Variable<int>(currentRoundNumber);
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
      firstDealerPlayerId: firstDealerPlayerId == null && nullToAbsent
          ? const Value.absent()
          : Value(firstDealerPlayerId),
      startedAt: startedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(startedAt),
      currentRoundNumber: currentRoundNumber == null && nullToAbsent
          ? const Value.absent()
          : Value(currentRoundNumber),
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
      firstDealerPlayerId: serializer.fromJson<String?>(
        json['firstDealerPlayerId'],
      ),
      startedAt: serializer.fromJson<DateTime?>(json['startedAt']),
      currentRoundNumber: serializer.fromJson<int?>(json['currentRoundNumber']),
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
      'firstDealerPlayerId': serializer.toJson<String?>(firstDealerPlayerId),
      'startedAt': serializer.toJson<DateTime?>(startedAt),
      'currentRoundNumber': serializer.toJson<int?>(currentRoundNumber),
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
    Value<String?> firstDealerPlayerId = const Value.absent(),
    Value<DateTime?> startedAt = const Value.absent(),
    Value<int?> currentRoundNumber = const Value.absent(),
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
    firstDealerPlayerId: firstDealerPlayerId.present
        ? firstDealerPlayerId.value
        : this.firstDealerPlayerId,
    startedAt: startedAt.present ? startedAt.value : this.startedAt,
    currentRoundNumber: currentRoundNumber.present
        ? currentRoundNumber.value
        : this.currentRoundNumber,
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
      firstDealerPlayerId: data.firstDealerPlayerId.present
          ? data.firstDealerPlayerId.value
          : this.firstDealerPlayerId,
      startedAt: data.startedAt.present ? data.startedAt.value : this.startedAt,
      currentRoundNumber: data.currentRoundNumber.present
          ? data.currentRoundNumber.value
          : this.currentRoundNumber,
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
          ..write('firstDealerPlayerId: $firstDealerPlayerId, ')
          ..write('startedAt: $startedAt, ')
          ..write('currentRoundNumber: $currentRoundNumber, ')
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
    firstDealerPlayerId,
    startedAt,
    currentRoundNumber,
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
          other.firstDealerPlayerId == this.firstDealerPlayerId &&
          other.startedAt == this.startedAt &&
          other.currentRoundNumber == this.currentRoundNumber &&
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
  final Value<String?> firstDealerPlayerId;
  final Value<DateTime?> startedAt;
  final Value<int?> currentRoundNumber;
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
    this.firstDealerPlayerId = const Value.absent(),
    this.startedAt = const Value.absent(),
    this.currentRoundNumber = const Value.absent(),
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
    this.firstDealerPlayerId = const Value.absent(),
    this.startedAt = const Value.absent(),
    this.currentRoundNumber = const Value.absent(),
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
    Expression<String>? firstDealerPlayerId,
    Expression<DateTime>? startedAt,
    Expression<int>? currentRoundNumber,
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
      if (firstDealerPlayerId != null)
        'first_dealer_player_id': firstDealerPlayerId,
      if (startedAt != null) 'started_at': startedAt,
      if (currentRoundNumber != null)
        'current_round_number': currentRoundNumber,
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
    Value<String?>? firstDealerPlayerId,
    Value<DateTime?>? startedAt,
    Value<int?>? currentRoundNumber,
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
      firstDealerPlayerId: firstDealerPlayerId ?? this.firstDealerPlayerId,
      startedAt: startedAt ?? this.startedAt,
      currentRoundNumber: currentRoundNumber ?? this.currentRoundNumber,
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
    if (firstDealerPlayerId.present) {
      map['first_dealer_player_id'] = Variable<String>(
        firstDealerPlayerId.value,
      );
    }
    if (startedAt.present) {
      map['started_at'] = Variable<DateTime>(startedAt.value);
    }
    if (currentRoundNumber.present) {
      map['current_round_number'] = Variable<int>(currentRoundNumber.value);
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
          ..write('firstDealerPlayerId: $firstDealerPlayerId, ')
          ..write('startedAt: $startedAt, ')
          ..write('currentRoundNumber: $currentRoundNumber, ')
          ..write('createdAt: $createdAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $RoundsTable extends Rounds with TableInfo<$RoundsTable, RoundEntry> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $RoundsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _gameIdMeta = const VerificationMeta('gameId');
  @override
  late final GeneratedColumn<String> gameId = GeneratedColumn<String>(
    'game_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _roundNumberMeta = const VerificationMeta(
    'roundNumber',
  );
  @override
  late final GeneratedColumn<int> roundNumber = GeneratedColumn<int>(
    'round_number',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _cardsInRoundMeta = const VerificationMeta(
    'cardsInRound',
  );
  @override
  late final GeneratedColumn<int> cardsInRound = GeneratedColumn<int>(
    'cards_in_round',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _dealerPlayerIdMeta = const VerificationMeta(
    'dealerPlayerId',
  );
  @override
  late final GeneratedColumn<String> dealerPlayerId = GeneratedColumn<String>(
    'dealer_player_id',
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
  @override
  late final GeneratedColumnWithTypeConverter<Map<String, int>, String> bids =
      GeneratedColumn<String>(
        'bids',
        aliasedName,
        false,
        type: DriftSqlType.string,
        requiredDuringInsert: true,
      ).withConverter<Map<String, int>>($RoundsTable.$converterbids);
  @override
  late final GeneratedColumnWithTypeConverter<Map<String, int>?, String>
  tricks = GeneratedColumn<String>(
    'tricks',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  ).withConverter<Map<String, int>?>($RoundsTable.$convertertricksn);
  @override
  late final GeneratedColumnWithTypeConverter<Map<String, int>?, String>
  scoresDelta = GeneratedColumn<String>(
    'scores_delta',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  ).withConverter<Map<String, int>?>($RoundsTable.$converterscoresDeltan);
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
  static const VerificationMeta _closedAtMeta = const VerificationMeta(
    'closedAt',
  );
  @override
  late final GeneratedColumn<DateTime> closedAt = GeneratedColumn<DateTime>(
    'closed_at',
    aliasedName,
    true,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    gameId,
    roundNumber,
    cardsInRound,
    dealerPlayerId,
    status,
    bids,
    tricks,
    scoresDelta,
    createdAt,
    closedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'rounds';
  @override
  VerificationContext validateIntegrity(
    Insertable<RoundEntry> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('game_id')) {
      context.handle(
        _gameIdMeta,
        gameId.isAcceptableOrUnknown(data['game_id']!, _gameIdMeta),
      );
    } else if (isInserting) {
      context.missing(_gameIdMeta);
    }
    if (data.containsKey('round_number')) {
      context.handle(
        _roundNumberMeta,
        roundNumber.isAcceptableOrUnknown(
          data['round_number']!,
          _roundNumberMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_roundNumberMeta);
    }
    if (data.containsKey('cards_in_round')) {
      context.handle(
        _cardsInRoundMeta,
        cardsInRound.isAcceptableOrUnknown(
          data['cards_in_round']!,
          _cardsInRoundMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_cardsInRoundMeta);
    }
    if (data.containsKey('dealer_player_id')) {
      context.handle(
        _dealerPlayerIdMeta,
        dealerPlayerId.isAcceptableOrUnknown(
          data['dealer_player_id']!,
          _dealerPlayerIdMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_dealerPlayerIdMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('closed_at')) {
      context.handle(
        _closedAtMeta,
        closedAt.isAcceptableOrUnknown(data['closed_at']!, _closedAtMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  List<Set<GeneratedColumn>> get uniqueKeys => [
    {gameId, roundNumber},
  ];
  @override
  RoundEntry map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return RoundEntry(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      gameId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}game_id'],
      )!,
      roundNumber: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}round_number'],
      )!,
      cardsInRound: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}cards_in_round'],
      )!,
      dealerPlayerId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}dealer_player_id'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
      bids: $RoundsTable.$converterbids.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}bids'],
        )!,
      ),
      tricks: $RoundsTable.$convertertricksn.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}tricks'],
        ),
      ),
      scoresDelta: $RoundsTable.$converterscoresDeltan.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}scores_delta'],
        ),
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      closedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}closed_at'],
      ),
    );
  }

  @override
  $RoundsTable createAlias(String alias) {
    return $RoundsTable(attachedDatabase, alias);
  }

  static TypeConverter<Map<String, int>, String> $converterbids =
      const MapStringIntConverter();
  static TypeConverter<Map<String, int>, String> $convertertricks =
      const MapStringIntConverter();
  static TypeConverter<Map<String, int>?, String?> $convertertricksn =
      NullAwareTypeConverter.wrap($convertertricks);
  static TypeConverter<Map<String, int>, String> $converterscoresDelta =
      const MapStringIntConverter();
  static TypeConverter<Map<String, int>?, String?> $converterscoresDeltan =
      NullAwareTypeConverter.wrap($converterscoresDelta);
}

class RoundEntry extends DataClass implements Insertable<RoundEntry> {
  final String id;
  final String gameId;
  final int roundNumber;
  final int cardsInRound;
  final String dealerPlayerId;
  final String status;
  final Map<String, int> bids;
  final Map<String, int>? tricks;
  final Map<String, int>? scoresDelta;
  final DateTime createdAt;
  final DateTime? closedAt;
  const RoundEntry({
    required this.id,
    required this.gameId,
    required this.roundNumber,
    required this.cardsInRound,
    required this.dealerPlayerId,
    required this.status,
    required this.bids,
    this.tricks,
    this.scoresDelta,
    required this.createdAt,
    this.closedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['game_id'] = Variable<String>(gameId);
    map['round_number'] = Variable<int>(roundNumber);
    map['cards_in_round'] = Variable<int>(cardsInRound);
    map['dealer_player_id'] = Variable<String>(dealerPlayerId);
    map['status'] = Variable<String>(status);
    {
      map['bids'] = Variable<String>($RoundsTable.$converterbids.toSql(bids));
    }
    if (!nullToAbsent || tricks != null) {
      map['tricks'] = Variable<String>(
        $RoundsTable.$convertertricksn.toSql(tricks),
      );
    }
    if (!nullToAbsent || scoresDelta != null) {
      map['scores_delta'] = Variable<String>(
        $RoundsTable.$converterscoresDeltan.toSql(scoresDelta),
      );
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    if (!nullToAbsent || closedAt != null) {
      map['closed_at'] = Variable<DateTime>(closedAt);
    }
    return map;
  }

  RoundsCompanion toCompanion(bool nullToAbsent) {
    return RoundsCompanion(
      id: Value(id),
      gameId: Value(gameId),
      roundNumber: Value(roundNumber),
      cardsInRound: Value(cardsInRound),
      dealerPlayerId: Value(dealerPlayerId),
      status: Value(status),
      bids: Value(bids),
      tricks: tricks == null && nullToAbsent
          ? const Value.absent()
          : Value(tricks),
      scoresDelta: scoresDelta == null && nullToAbsent
          ? const Value.absent()
          : Value(scoresDelta),
      createdAt: Value(createdAt),
      closedAt: closedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(closedAt),
    );
  }

  factory RoundEntry.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return RoundEntry(
      id: serializer.fromJson<String>(json['id']),
      gameId: serializer.fromJson<String>(json['gameId']),
      roundNumber: serializer.fromJson<int>(json['roundNumber']),
      cardsInRound: serializer.fromJson<int>(json['cardsInRound']),
      dealerPlayerId: serializer.fromJson<String>(json['dealerPlayerId']),
      status: serializer.fromJson<String>(json['status']),
      bids: serializer.fromJson<Map<String, int>>(json['bids']),
      tricks: serializer.fromJson<Map<String, int>?>(json['tricks']),
      scoresDelta: serializer.fromJson<Map<String, int>?>(json['scoresDelta']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      closedAt: serializer.fromJson<DateTime?>(json['closedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'gameId': serializer.toJson<String>(gameId),
      'roundNumber': serializer.toJson<int>(roundNumber),
      'cardsInRound': serializer.toJson<int>(cardsInRound),
      'dealerPlayerId': serializer.toJson<String>(dealerPlayerId),
      'status': serializer.toJson<String>(status),
      'bids': serializer.toJson<Map<String, int>>(bids),
      'tricks': serializer.toJson<Map<String, int>?>(tricks),
      'scoresDelta': serializer.toJson<Map<String, int>?>(scoresDelta),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'closedAt': serializer.toJson<DateTime?>(closedAt),
    };
  }

  RoundEntry copyWith({
    String? id,
    String? gameId,
    int? roundNumber,
    int? cardsInRound,
    String? dealerPlayerId,
    String? status,
    Map<String, int>? bids,
    Value<Map<String, int>?> tricks = const Value.absent(),
    Value<Map<String, int>?> scoresDelta = const Value.absent(),
    DateTime? createdAt,
    Value<DateTime?> closedAt = const Value.absent(),
  }) => RoundEntry(
    id: id ?? this.id,
    gameId: gameId ?? this.gameId,
    roundNumber: roundNumber ?? this.roundNumber,
    cardsInRound: cardsInRound ?? this.cardsInRound,
    dealerPlayerId: dealerPlayerId ?? this.dealerPlayerId,
    status: status ?? this.status,
    bids: bids ?? this.bids,
    tricks: tricks.present ? tricks.value : this.tricks,
    scoresDelta: scoresDelta.present ? scoresDelta.value : this.scoresDelta,
    createdAt: createdAt ?? this.createdAt,
    closedAt: closedAt.present ? closedAt.value : this.closedAt,
  );
  RoundEntry copyWithCompanion(RoundsCompanion data) {
    return RoundEntry(
      id: data.id.present ? data.id.value : this.id,
      gameId: data.gameId.present ? data.gameId.value : this.gameId,
      roundNumber: data.roundNumber.present
          ? data.roundNumber.value
          : this.roundNumber,
      cardsInRound: data.cardsInRound.present
          ? data.cardsInRound.value
          : this.cardsInRound,
      dealerPlayerId: data.dealerPlayerId.present
          ? data.dealerPlayerId.value
          : this.dealerPlayerId,
      status: data.status.present ? data.status.value : this.status,
      bids: data.bids.present ? data.bids.value : this.bids,
      tricks: data.tricks.present ? data.tricks.value : this.tricks,
      scoresDelta: data.scoresDelta.present
          ? data.scoresDelta.value
          : this.scoresDelta,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      closedAt: data.closedAt.present ? data.closedAt.value : this.closedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('RoundEntry(')
          ..write('id: $id, ')
          ..write('gameId: $gameId, ')
          ..write('roundNumber: $roundNumber, ')
          ..write('cardsInRound: $cardsInRound, ')
          ..write('dealerPlayerId: $dealerPlayerId, ')
          ..write('status: $status, ')
          ..write('bids: $bids, ')
          ..write('tricks: $tricks, ')
          ..write('scoresDelta: $scoresDelta, ')
          ..write('createdAt: $createdAt, ')
          ..write('closedAt: $closedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    gameId,
    roundNumber,
    cardsInRound,
    dealerPlayerId,
    status,
    bids,
    tricks,
    scoresDelta,
    createdAt,
    closedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is RoundEntry &&
          other.id == this.id &&
          other.gameId == this.gameId &&
          other.roundNumber == this.roundNumber &&
          other.cardsInRound == this.cardsInRound &&
          other.dealerPlayerId == this.dealerPlayerId &&
          other.status == this.status &&
          other.bids == this.bids &&
          other.tricks == this.tricks &&
          other.scoresDelta == this.scoresDelta &&
          other.createdAt == this.createdAt &&
          other.closedAt == this.closedAt);
}

class RoundsCompanion extends UpdateCompanion<RoundEntry> {
  final Value<String> id;
  final Value<String> gameId;
  final Value<int> roundNumber;
  final Value<int> cardsInRound;
  final Value<String> dealerPlayerId;
  final Value<String> status;
  final Value<Map<String, int>> bids;
  final Value<Map<String, int>?> tricks;
  final Value<Map<String, int>?> scoresDelta;
  final Value<DateTime> createdAt;
  final Value<DateTime?> closedAt;
  final Value<int> rowid;
  const RoundsCompanion({
    this.id = const Value.absent(),
    this.gameId = const Value.absent(),
    this.roundNumber = const Value.absent(),
    this.cardsInRound = const Value.absent(),
    this.dealerPlayerId = const Value.absent(),
    this.status = const Value.absent(),
    this.bids = const Value.absent(),
    this.tricks = const Value.absent(),
    this.scoresDelta = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.closedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  RoundsCompanion.insert({
    required String id,
    required String gameId,
    required int roundNumber,
    required int cardsInRound,
    required String dealerPlayerId,
    required String status,
    required Map<String, int> bids,
    this.tricks = const Value.absent(),
    this.scoresDelta = const Value.absent(),
    required DateTime createdAt,
    this.closedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       gameId = Value(gameId),
       roundNumber = Value(roundNumber),
       cardsInRound = Value(cardsInRound),
       dealerPlayerId = Value(dealerPlayerId),
       status = Value(status),
       bids = Value(bids),
       createdAt = Value(createdAt);
  static Insertable<RoundEntry> custom({
    Expression<String>? id,
    Expression<String>? gameId,
    Expression<int>? roundNumber,
    Expression<int>? cardsInRound,
    Expression<String>? dealerPlayerId,
    Expression<String>? status,
    Expression<String>? bids,
    Expression<String>? tricks,
    Expression<String>? scoresDelta,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? closedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (gameId != null) 'game_id': gameId,
      if (roundNumber != null) 'round_number': roundNumber,
      if (cardsInRound != null) 'cards_in_round': cardsInRound,
      if (dealerPlayerId != null) 'dealer_player_id': dealerPlayerId,
      if (status != null) 'status': status,
      if (bids != null) 'bids': bids,
      if (tricks != null) 'tricks': tricks,
      if (scoresDelta != null) 'scores_delta': scoresDelta,
      if (createdAt != null) 'created_at': createdAt,
      if (closedAt != null) 'closed_at': closedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  RoundsCompanion copyWith({
    Value<String>? id,
    Value<String>? gameId,
    Value<int>? roundNumber,
    Value<int>? cardsInRound,
    Value<String>? dealerPlayerId,
    Value<String>? status,
    Value<Map<String, int>>? bids,
    Value<Map<String, int>?>? tricks,
    Value<Map<String, int>?>? scoresDelta,
    Value<DateTime>? createdAt,
    Value<DateTime?>? closedAt,
    Value<int>? rowid,
  }) {
    return RoundsCompanion(
      id: id ?? this.id,
      gameId: gameId ?? this.gameId,
      roundNumber: roundNumber ?? this.roundNumber,
      cardsInRound: cardsInRound ?? this.cardsInRound,
      dealerPlayerId: dealerPlayerId ?? this.dealerPlayerId,
      status: status ?? this.status,
      bids: bids ?? this.bids,
      tricks: tricks ?? this.tricks,
      scoresDelta: scoresDelta ?? this.scoresDelta,
      createdAt: createdAt ?? this.createdAt,
      closedAt: closedAt ?? this.closedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (gameId.present) {
      map['game_id'] = Variable<String>(gameId.value);
    }
    if (roundNumber.present) {
      map['round_number'] = Variable<int>(roundNumber.value);
    }
    if (cardsInRound.present) {
      map['cards_in_round'] = Variable<int>(cardsInRound.value);
    }
    if (dealerPlayerId.present) {
      map['dealer_player_id'] = Variable<String>(dealerPlayerId.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (bids.present) {
      map['bids'] = Variable<String>(
        $RoundsTable.$converterbids.toSql(bids.value),
      );
    }
    if (tricks.present) {
      map['tricks'] = Variable<String>(
        $RoundsTable.$convertertricksn.toSql(tricks.value),
      );
    }
    if (scoresDelta.present) {
      map['scores_delta'] = Variable<String>(
        $RoundsTable.$converterscoresDeltan.toSql(scoresDelta.value),
      );
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (closedAt.present) {
      map['closed_at'] = Variable<DateTime>(closedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('RoundsCompanion(')
          ..write('id: $id, ')
          ..write('gameId: $gameId, ')
          ..write('roundNumber: $roundNumber, ')
          ..write('cardsInRound: $cardsInRound, ')
          ..write('dealerPlayerId: $dealerPlayerId, ')
          ..write('status: $status, ')
          ..write('bids: $bids, ')
          ..write('tricks: $tricks, ')
          ..write('scoresDelta: $scoresDelta, ')
          ..write('createdAt: $createdAt, ')
          ..write('closedAt: $closedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $GamesTable games = $GamesTable(this);
  late final $RoundsTable rounds = $RoundsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [games, rounds];
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
      Value<String?> firstDealerPlayerId,
      Value<DateTime?> startedAt,
      Value<int?> currentRoundNumber,
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
      Value<String?> firstDealerPlayerId,
      Value<DateTime?> startedAt,
      Value<int?> currentRoundNumber,
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

  ColumnFilters<String> get firstDealerPlayerId => $composableBuilder(
    column: $table.firstDealerPlayerId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get startedAt => $composableBuilder(
    column: $table.startedAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get currentRoundNumber => $composableBuilder(
    column: $table.currentRoundNumber,
    builder: (column) => ColumnFilters(column),
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

  ColumnOrderings<String> get firstDealerPlayerId => $composableBuilder(
    column: $table.firstDealerPlayerId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get startedAt => $composableBuilder(
    column: $table.startedAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get currentRoundNumber => $composableBuilder(
    column: $table.currentRoundNumber,
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

  GeneratedColumn<String> get firstDealerPlayerId => $composableBuilder(
    column: $table.firstDealerPlayerId,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get startedAt =>
      $composableBuilder(column: $table.startedAt, builder: (column) => column);

  GeneratedColumn<int> get currentRoundNumber => $composableBuilder(
    column: $table.currentRoundNumber,
    builder: (column) => column,
  );

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
                Value<String?> firstDealerPlayerId = const Value.absent(),
                Value<DateTime?> startedAt = const Value.absent(),
                Value<int?> currentRoundNumber = const Value.absent(),
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
                firstDealerPlayerId: firstDealerPlayerId,
                startedAt: startedAt,
                currentRoundNumber: currentRoundNumber,
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
                Value<String?> firstDealerPlayerId = const Value.absent(),
                Value<DateTime?> startedAt = const Value.absent(),
                Value<int?> currentRoundNumber = const Value.absent(),
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
                firstDealerPlayerId: firstDealerPlayerId,
                startedAt: startedAt,
                currentRoundNumber: currentRoundNumber,
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
typedef $$RoundsTableCreateCompanionBuilder =
    RoundsCompanion Function({
      required String id,
      required String gameId,
      required int roundNumber,
      required int cardsInRound,
      required String dealerPlayerId,
      required String status,
      required Map<String, int> bids,
      Value<Map<String, int>?> tricks,
      Value<Map<String, int>?> scoresDelta,
      required DateTime createdAt,
      Value<DateTime?> closedAt,
      Value<int> rowid,
    });
typedef $$RoundsTableUpdateCompanionBuilder =
    RoundsCompanion Function({
      Value<String> id,
      Value<String> gameId,
      Value<int> roundNumber,
      Value<int> cardsInRound,
      Value<String> dealerPlayerId,
      Value<String> status,
      Value<Map<String, int>> bids,
      Value<Map<String, int>?> tricks,
      Value<Map<String, int>?> scoresDelta,
      Value<DateTime> createdAt,
      Value<DateTime?> closedAt,
      Value<int> rowid,
    });

class $$RoundsTableFilterComposer
    extends Composer<_$AppDatabase, $RoundsTable> {
  $$RoundsTableFilterComposer({
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

  ColumnFilters<String> get gameId => $composableBuilder(
    column: $table.gameId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get roundNumber => $composableBuilder(
    column: $table.roundNumber,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get cardsInRound => $composableBuilder(
    column: $table.cardsInRound,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get dealerPlayerId => $composableBuilder(
    column: $table.dealerPlayerId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );

  ColumnWithTypeConverterFilters<Map<String, int>, Map<String, int>, String>
  get bids => $composableBuilder(
    column: $table.bids,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnWithTypeConverterFilters<Map<String, int>?, Map<String, int>, String>
  get tricks => $composableBuilder(
    column: $table.tricks,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnWithTypeConverterFilters<Map<String, int>?, Map<String, int>, String>
  get scoresDelta => $composableBuilder(
    column: $table.scoresDelta,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get closedAt => $composableBuilder(
    column: $table.closedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$RoundsTableOrderingComposer
    extends Composer<_$AppDatabase, $RoundsTable> {
  $$RoundsTableOrderingComposer({
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

  ColumnOrderings<String> get gameId => $composableBuilder(
    column: $table.gameId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get roundNumber => $composableBuilder(
    column: $table.roundNumber,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get cardsInRound => $composableBuilder(
    column: $table.cardsInRound,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get dealerPlayerId => $composableBuilder(
    column: $table.dealerPlayerId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get bids => $composableBuilder(
    column: $table.bids,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get tricks => $composableBuilder(
    column: $table.tricks,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get scoresDelta => $composableBuilder(
    column: $table.scoresDelta,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get closedAt => $composableBuilder(
    column: $table.closedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$RoundsTableAnnotationComposer
    extends Composer<_$AppDatabase, $RoundsTable> {
  $$RoundsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get gameId =>
      $composableBuilder(column: $table.gameId, builder: (column) => column);

  GeneratedColumn<int> get roundNumber => $composableBuilder(
    column: $table.roundNumber,
    builder: (column) => column,
  );

  GeneratedColumn<int> get cardsInRound => $composableBuilder(
    column: $table.cardsInRound,
    builder: (column) => column,
  );

  GeneratedColumn<String> get dealerPlayerId => $composableBuilder(
    column: $table.dealerPlayerId,
    builder: (column) => column,
  );

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumnWithTypeConverter<Map<String, int>, String> get bids =>
      $composableBuilder(column: $table.bids, builder: (column) => column);

  GeneratedColumnWithTypeConverter<Map<String, int>?, String> get tricks =>
      $composableBuilder(column: $table.tricks, builder: (column) => column);

  GeneratedColumnWithTypeConverter<Map<String, int>?, String> get scoresDelta =>
      $composableBuilder(
        column: $table.scoresDelta,
        builder: (column) => column,
      );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get closedAt =>
      $composableBuilder(column: $table.closedAt, builder: (column) => column);
}

class $$RoundsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $RoundsTable,
          RoundEntry,
          $$RoundsTableFilterComposer,
          $$RoundsTableOrderingComposer,
          $$RoundsTableAnnotationComposer,
          $$RoundsTableCreateCompanionBuilder,
          $$RoundsTableUpdateCompanionBuilder,
          (RoundEntry, BaseReferences<_$AppDatabase, $RoundsTable, RoundEntry>),
          RoundEntry,
          PrefetchHooks Function()
        > {
  $$RoundsTableTableManager(_$AppDatabase db, $RoundsTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$RoundsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$RoundsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$RoundsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> gameId = const Value.absent(),
                Value<int> roundNumber = const Value.absent(),
                Value<int> cardsInRound = const Value.absent(),
                Value<String> dealerPlayerId = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<Map<String, int>> bids = const Value.absent(),
                Value<Map<String, int>?> tricks = const Value.absent(),
                Value<Map<String, int>?> scoresDelta = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime?> closedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => RoundsCompanion(
                id: id,
                gameId: gameId,
                roundNumber: roundNumber,
                cardsInRound: cardsInRound,
                dealerPlayerId: dealerPlayerId,
                status: status,
                bids: bids,
                tricks: tricks,
                scoresDelta: scoresDelta,
                createdAt: createdAt,
                closedAt: closedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String gameId,
                required int roundNumber,
                required int cardsInRound,
                required String dealerPlayerId,
                required String status,
                required Map<String, int> bids,
                Value<Map<String, int>?> tricks = const Value.absent(),
                Value<Map<String, int>?> scoresDelta = const Value.absent(),
                required DateTime createdAt,
                Value<DateTime?> closedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => RoundsCompanion.insert(
                id: id,
                gameId: gameId,
                roundNumber: roundNumber,
                cardsInRound: cardsInRound,
                dealerPlayerId: dealerPlayerId,
                status: status,
                bids: bids,
                tricks: tricks,
                scoresDelta: scoresDelta,
                createdAt: createdAt,
                closedAt: closedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$RoundsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $RoundsTable,
      RoundEntry,
      $$RoundsTableFilterComposer,
      $$RoundsTableOrderingComposer,
      $$RoundsTableAnnotationComposer,
      $$RoundsTableCreateCompanionBuilder,
      $$RoundsTableUpdateCompanionBuilder,
      (RoundEntry, BaseReferences<_$AppDatabase, $RoundsTable, RoundEntry>),
      RoundEntry,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$GamesTableTableManager get games =>
      $$GamesTableTableManager(_db, _db.games);
  $$RoundsTableTableManager get rounds =>
      $$RoundsTableTableManager(_db, _db.rounds);
}
