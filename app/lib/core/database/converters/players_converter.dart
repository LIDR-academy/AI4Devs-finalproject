import 'dart:convert';

import 'package:drift/drift.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

class PlayersConverter extends TypeConverter<List<PlayerEmbed>, String> {
  const PlayersConverter();

  @override
  List<PlayerEmbed> fromSql(String fromDb) {
    final decoded = jsonDecode(fromDb) as List<dynamic>;
    return decoded
        .map((item) => PlayerEmbed.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  @override
  String toSql(List<PlayerEmbed> value) {
    return jsonEncode(value.map((player) => player.toJson()).toList());
  }
}
