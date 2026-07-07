import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';

class CorrectBidsUseCase {
  const CorrectBidsUseCase(this._roundRepository);

  final RoundRepository _roundRepository;

  Future<Round> call({
    required Round round,
    required Map<String, int> updatedBids,
    required List<String> playerIds,
  }) async {
    if (round.status != RoundStatus.playing) {
      throw StateError('Bids can only be corrected while the round is playing');
    }

    for (final playerId in playerIds) {
      final bid = updatedBids[playerId];
      if (bid == null) {
        throw ArgumentError('Missing bid for player: $playerId');
      }
      if (bid < 0 || bid > round.cardsInRound) {
        throw ArgumentError(
          'Bid for $playerId must be between 0 and ${round.cardsInRound}, '
          'got $bid',
        );
      }
    }

    return _roundRepository.updateRound(
      round.copyWith(bids: Map<String, int>.from(updatedBids)),
    );
  }
}
