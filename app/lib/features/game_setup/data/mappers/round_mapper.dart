import 'package:drift/drift.dart';
import 'package:la_pocha/core/database/app_database.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart' as domain;
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';

class RoundMapper {
  const RoundMapper._();

  static domain.Round toDomain(RoundEntry entry) {
    return domain.Round(
      id: entry.id,
      gameId: entry.gameId,
      roundNumber: entry.roundNumber,
      cardsInRound: entry.cardsInRound,
      dealerPlayerId: entry.dealerPlayerId,
      status: RoundStatus.fromStorageString(entry.status),
      bids: entry.bids,
      tricks: entry.tricks,
      scoresDelta: entry.scoresDelta,
      createdAt: entry.createdAt,
      closedAt: entry.closedAt,
    );
  }

  static RoundsCompanion toCompanion(domain.Round round) {
    return RoundsCompanion.insert(
      id: round.id,
      gameId: round.gameId,
      roundNumber: round.roundNumber,
      cardsInRound: round.cardsInRound,
      dealerPlayerId: round.dealerPlayerId,
      status: round.status.toStorageString(),
      bids: round.bids,
      tricks: Value(round.tricks),
      scoresDelta: Value(round.scoresDelta),
      createdAt: round.createdAt,
      closedAt: Value(round.closedAt),
    );
  }
}
