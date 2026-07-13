import 'dart:convert';

import 'package:drift/drift.dart';

class MapStringIntConverter extends TypeConverter<Map<String, int>, String> {
  const MapStringIntConverter();

  @override
  Map<String, int> fromSql(String fromDb) {
    final decoded = jsonDecode(fromDb) as Map<String, dynamic>;
    return decoded.map((key, value) => MapEntry(key, value as int));
  }

  @override
  String toSql(Map<String, int> value) {
    return jsonEncode(value);
  }
}
