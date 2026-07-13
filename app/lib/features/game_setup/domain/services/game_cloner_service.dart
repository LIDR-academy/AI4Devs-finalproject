import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';

class GameClonerService {
  const GameClonerService();

  Game cloneForRepeat({
    required Game source,
    required String newGameId,
    required DateTime now,
    required String Function() generatePlayerId,
  }) {
    return Game(
      id: newGameId,
      status: GameStatus.setup,
      playerCount: source.playerCount,
      totalCards: source.totalCards,
      maxCardsPerRound: source.maxCardsPerRound,
      roundSequence: List.of(source.roundSequence),
      players: source.players
          .map(
            (player) => PlayerEmbed(
              id: generatePlayerId(),
              displayName: player.displayName,
              isGuest: player.isGuest,
              userId: player.userId,
              seatOrder: player.seatOrder,
              totalScore: 0,
              joinedAt: now,
            ),
          )
          .toList(),
      createdAt: now,
      updatedAt: now,
    );
  }
}
