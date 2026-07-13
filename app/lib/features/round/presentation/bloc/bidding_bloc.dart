import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';
import 'package:la_pocha/features/round/domain/services/dealer_restriction_validator.dart';
import 'package:la_pocha/features/round/domain/usecases/close_bidding_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/load_bidding_context_usecase.dart';
import 'package:la_pocha/features/round/domain/usecases/submit_bid_usecase.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_event.dart';
import 'package:la_pocha/features/round/presentation/bloc/bidding_state.dart';

class BiddingBloc extends Bloc<BiddingEvent, BiddingState> {
  BiddingBloc({
    required this._loadBiddingContext,
    required this._submitBid,
    required this._closeBidding,
    DealerRestrictionValidator? validator,
  }) : _validator = validator ?? const DealerRestrictionValidator(),
       super(const BiddingInitial()) {
    on<BiddingStarted>(_onBiddingStarted);
    on<BidValueChanged>(_onBidValueChanged);
    on<BidConfirmed>(_onBidConfirmed);
    on<CloseBiddingRequested>(_onCloseBiddingRequested);
  }

  final LoadBiddingContextUseCase _loadBiddingContext;
  final SubmitBidUseCase _submitBid;
  final CloseBiddingUseCase _closeBidding;
  final DealerRestrictionValidator _validator;

  Future<void> _onBiddingStarted(
    BiddingStarted event,
    Emitter<BiddingState> emit,
  ) async {
    emit(const BiddingLoading());
    try {
      final context = await _loadBiddingContext(
        gameId: event.gameId,
        roundNumber: event.roundNumber,
      );
      emit(
        _buildLoadedState(
          game: context.game,
          round: context.round,
          biddingOrder: context.biddingOrder,
          currentPlayerId: context.currentPlayerId,
          draftBid: 0,
        ),
      );
    } catch (error) {
      emit(BiddingFailure(message: error.toString()));
    }
  }

  void _onBidValueChanged(BidValueChanged event, Emitter<BiddingState> emit) {
    final current = state;
    if (current is! BiddingLoaded || current.currentPlayerId == null) {
      return;
    }

    emit(
      _buildLoadedState(
        game: current.game,
        round: current.round,
        biddingOrder: current.biddingOrder,
        currentPlayerId: current.currentPlayerId,
        draftBid: event.bid,
      ),
    );
  }

  Future<void> _onBidConfirmed(
    BidConfirmed event,
    Emitter<BiddingState> emit,
  ) async {
    final current = state;
    if (current is! BiddingLoaded ||
        current.currentPlayerId == null ||
        !current.canConfirmBid ||
        current.isSubmitting) {
      return;
    }

    emit(current.copyWith(isSubmitting: true, validationMessage: () => null));
    try {
      final result = await _submitBid(
        round: current.round,
        biddingOrder: current.biddingOrder,
        currentPlayerId: current.currentPlayerId!,
        bid: current.draftBid,
      );

      emit(
        _buildLoadedState(
          game: current.game,
          round: result.round,
          biddingOrder: result.biddingOrder,
          currentPlayerId: result.currentPlayerId,
          draftBid: 0,
        ),
      );
    } catch (error) {
      emit(
        current.copyWith(
          isSubmitting: false,
          validationMessage: () => error.toString(),
        ),
      );
    }
  }

  Future<void> _onCloseBiddingRequested(
    CloseBiddingRequested event,
    Emitter<BiddingState> emit,
  ) async {
    final current = state;
    if (current is! BiddingLoaded || !current.canClose || current.isClosing) {
      return;
    }

    emit(current.copyWith(isClosing: true));
    try {
      await _closeBidding(
        round: current.round,
        playerIds: current.biddingOrder,
      );
      emit(
        BiddingNavigateToPlay(
          gameId: current.game.id,
          roundNumber: current.round.roundNumber,
        ),
      );
    } catch (error) {
      emit(
        current.copyWith(
          isClosing: false,
          validationMessage: () => error.toString(),
        ),
      );
    }
  }

  BiddingLoaded _buildLoadedState({
    required Game game,
    required Round round,
    required List<String> biddingOrder,
    required String? currentPlayerId,
    required int draftBid,
  }) {
    final partialSum = _validator.partialBidSum(round.bids);
    final availableTricks = _validator.availableTricks(
      cardsInRound: round.cardsInRound,
      bids: round.bids,
    );

    final isDealerTurn = currentPlayerId == round.dealerPlayerId;
    final forbiddenBid = isDealerTurn
        ? _validator.forbiddenBidForDealer(
            cardsInRound: round.cardsInRound,
            bidsBeforeDealer: round.bids,
          )
        : null;

    final isDraftInRange = draftBid >= 0 && draftBid <= round.cardsInRound;
    final isForbidden =
        forbiddenBid != null &&
        _validator.isForbiddenBid(bid: draftBid, forbiddenBid: forbiddenBid);

    final canConfirmBid =
        currentPlayerId != null && isDraftInRange && !isForbidden;

    final validationMessage = isForbidden
        ? 'El repartidor no puede apostar $draftBid porque la suma '
              'igualaría ${round.cardsInRound} bazas'
        : null;

    final canClose = _validator.canClose(
      cardsInRound: round.cardsInRound,
      bids: round.bids,
      playerIds: biddingOrder,
    );

    return BiddingLoaded(
      game: game,
      round: round,
      biddingOrder: biddingOrder,
      currentPlayerId: currentPlayerId,
      draftBid: draftBid,
      partialSum: partialSum,
      availableTricks: availableTricks,
      forbiddenBid: forbiddenBid,
      canConfirmBid: canConfirmBid,
      canClose: canClose,
      validationMessage: validationMessage,
    );
  }
}
