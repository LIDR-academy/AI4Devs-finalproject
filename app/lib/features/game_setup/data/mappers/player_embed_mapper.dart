import 'package:la_pocha/features/game_setup/data/models/player_embed_model.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

class PlayerEmbedMapper {
  const PlayerEmbedMapper._();

  static PlayerEmbed toDomain(PlayerEmbedModel model) {
    return PlayerEmbed(
      id: model.id,
      displayName: model.displayName,
      isGuest: model.isGuest,
      userId: model.userId,
      seatOrder: model.seatOrder,
      totalScore: model.totalScore,
      joinedAt: model.joinedAt,
    );
  }

  static PlayerEmbedModel fromDomain(PlayerEmbed player) {
    return PlayerEmbedModel(
      id: player.id,
      displayName: player.displayName,
      isGuest: player.isGuest,
      userId: player.userId,
      seatOrder: player.seatOrder,
      totalScore: player.totalScore,
      joinedAt: player.joinedAt,
    );
  }
}
