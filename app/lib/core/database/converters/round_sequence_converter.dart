import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_definition.dart';

class RoundSequenceConverter extends TypeConverter<List<RoundDefinition>, String> {
  const RoundSequenceConverter();

  @override
  List<RoundDefinition> fromSql(String fromDb) {
    final decoded = jsonDecode(fromDb) as List<dynamic>;
    return decoded
        .map((item) => RoundDefinition.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  @override
  String toSql(List<RoundDefinition> value) {
    return jsonEncode(value.map((round) => round.toJson()).toList());
  }
}
