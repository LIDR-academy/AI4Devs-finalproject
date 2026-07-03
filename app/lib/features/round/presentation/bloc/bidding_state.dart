import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';

sealed class BiddingState extends Equatable {
  const BiddingState();

  @override
  List<Object?> get props => [];
}

final class BiddingInitial extends BiddingState {
  const BiddingInitial();
}

final class BiddingLoading extends BiddingState {
  const BiddingLoading();
}

final class BiddingFailure extends BiddingState {
  const BiddingFailure({required this.message});

  final String message;

  @override
  List<Object?> get props => [message];
}

final class BiddingLoaded extends BiddingState {
  const BiddingLoaded({
    required this.game,
    required this.round,
    required this.biddingOrder,
    required this.currentPlayerId,
    required this.draftBid,
    required this.partialSum,
    required this.availableTricks,
    this.forbiddenBid,
    required this.canConfirmBid,
    required this.canClose,
    this.validationMessage,
    this.isSubmitting = false,
    this.isClosing = false,
  });

  final Game game;
  final Round round;
  final List<String> biddingOrder;
  final String? currentPlayerId;
  final int draftBid;
  final int partialSum;
  final int availableTricks;
  final int? forbiddenBid;
  final bool canConfirmBid;
  final bool canClose;
  final String? validationMessage;
  final bool isSubmitting;
  final bool isClosing;

  BiddingLoaded copyWith({
    Game? game,
    Round? round,
    List<String>? biddingOrder,
    String? currentPlayerId,
    int? draftBid,
    int? partialSum,
    int? availableTricks,
    int? Function()? forbiddenBid,
    bool? canConfirmBid,
    bool? canClose,
    String? Function()? validationMessage,
    bool? isSubmitting,
    bool? isClosing,
  }) {
    return BiddingLoaded(
      game: game ?? this.game,
      round: round ?? this.round,
      biddingOrder: biddingOrder ?? this.biddingOrder,
      currentPlayerId: currentPlayerId ?? this.currentPlayerId,
      draftBid: draftBid ?? this.draftBid,
      partialSum: partialSum ?? this.partialSum,
      availableTricks: availableTricks ?? this.availableTricks,
      forbiddenBid:
          forbiddenBid != null ? forbiddenBid() : this.forbiddenBid,
      canConfirmBid: canConfirmBid ?? this.canConfirmBid,
      canClose: canClose ?? this.canClose,
      validationMessage: validationMessage != null
          ? validationMessage()
          : this.validationMessage,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isClosing: isClosing ?? this.isClosing,
    );
  }

  @override
  List<Object?> get props => [
        game,
        round,
        biddingOrder,
        currentPlayerId,
        draftBid,
        partialSum,
        availableTricks,
        forbiddenBid,
        canConfirmBid,
        canClose,
        validationMessage,
        isSubmitting,
        isClosing,
      ];
}

final class BiddingNavigateToPlay extends BiddingState {
  const BiddingNavigateToPlay({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundNumber];
}
