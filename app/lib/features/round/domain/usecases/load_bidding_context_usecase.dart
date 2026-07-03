import 'package:la_pocha/features/game_setup/domain/entities/game_status.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round_status.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/game_repository.dart';
import 'package:la_pocha/features/game_setup/domain/repositories/round_repository.dart';
import 'package:la_pocha/features/round/domain/entities/bidding_context.dart';
import 'package:la_pocha/features/round/domain/services/bid_order_service.dart';

class LoadBiddingContextUseCase {
  LoadBiddingContextUseCase(
    this._gameRepository,
    this._roundRepository, {
    BidOrderService? bidOrderService,
  }) : _bidOrderService = bidOrderService ?? const BidOrderService();

  final GameRepository _gameRepository;
  final RoundRepository _roundRepository;
  final BidOrderService _bidOrderService;

  Future<BiddingContext> call({
    required String gameId,
    required int roundNumber,
  }) async {
    final game = await _gameRepository.getGameById(gameId);
    if (game == null) {
      throw StateError('Game not found: $gameId');
    }

    if (game.status != GameStatus.inProgress) {
      throw StateError('Game must be in progress to load bidding');
    }

    final round = await _roundRepository.getRoundByGameAndNumber(
      gameId,
      roundNumber,
    );
    if (round == null) {
      throw StateError('Round not found: $gameId/$roundNumber');
    }

    if (round.status != RoundStatus.bidding) {
      throw StateError('Round is not in bidding status');
    }

    final biddingOrder = _bidOrderService.biddingOrder(
      players: game.players,
      dealerPlayerId: round.dealerPlayerId,
    );

    final currentPlayerId = _currentPlayerId(
      biddingOrder: biddingOrder,
      bids: round.bids,
    );

    return BiddingContext(
      game: game,
      round: round,
      biddingOrder: biddingOrder,
      currentPlayerId: currentPlayerId,
    );
  }

  String? _currentPlayerId({
    required List<String> biddingOrder,
    required Map<String, int> bids,
  }) {
    for (final playerId in biddingOrder) {
      if (!bids.containsKey(playerId)) {
        return playerId;
      }
    }
    return null;
  }
}
