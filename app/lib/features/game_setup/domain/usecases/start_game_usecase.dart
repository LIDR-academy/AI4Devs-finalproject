import '../entities/game.dart';
import '../entities/game_status.dart';
import '../entities/player_embed.dart';
import '../entities/round.dart';
import '../entities/round_status.dart';
import '../entities/start_game_result.dart';
import '../repositories/game_repository.dart';
import 'set_first_dealer_usecase.dart';

class StartGameUseCase {
  StartGameUseCase(
    this._repository, {
    SetFirstDealerUseCase? setFirstDealer,
  }) : _setFirstDealer = setFirstDealer ?? const SetFirstDealerUseCase();

  final GameRepository _repository;
  final SetFirstDealerUseCase _setFirstDealer;

  Future<StartGameResult> call({
    required Game game,
    required List<PlayerEmbed> players,
    required String firstDealerPlayerId,
  }) async {
    if (game.status != GameStatus.setup) {
      throw StateError('Game must be in setup status to start');
    }

    if (players.length != game.playerCount) {
      throw ArgumentError(
        'Expected ${game.playerCount} players, got ${players.length}',
      );
    }

    if (game.roundSequence.isEmpty) {
      throw StateError('Game round sequence is empty');
    }

    _setFirstDealer(players: players, playerId: firstDealerPlayerId);

    final now = DateTime.now();
    final firstRound = Round(
      id: '',
      gameId: game.id,
      roundNumber: 1,
      cardsInRound: game.roundSequence.first.cardsPerPlayer,
      dealerPlayerId: firstDealerPlayerId,
      status: RoundStatus.bidding,
      bids: const {},
      createdAt: now,
    );

    return _repository.startGame(
      gameId: game.id,
      players: players,
      firstDealerPlayerId: firstDealerPlayerId,
      firstRound: firstRound,
    );
  }
}
