import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart' as domain;
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';

class GameMapper {
  const GameMapper._();

  static domain.Game toDomain(GameEntry entry) {
    return domain.Game(
      id: entry.id,
      status: GameStatus.fromStorageString(entry.status),
      playerCount: entry.playerCount,
      totalCards: entry.totalCards,
      maxCardsPerRound: entry.maxCardsPerRound,
      roundSequence: entry.roundSequence,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    );
  }

  static GamesCompanion toCompanion(domain.Game game) {
    return GamesCompanion.insert(
      id: game.id,
      status: game.status.toStorageString(),
      playerCount: game.playerCount,
      totalCards: game.totalCards,
      maxCardsPerRound: game.maxCardsPerRound,
      roundSequence: game.roundSequence,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    );
  }
}
