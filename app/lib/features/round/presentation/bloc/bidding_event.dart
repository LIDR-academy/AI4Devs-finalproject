import 'package:equatable/equatable.dart';

sealed class BiddingEvent extends Equatable {
  const BiddingEvent();

  @override
  List<Object?> get props => [];
}

final class BiddingStarted extends BiddingEvent {
  const BiddingStarted({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundNumber];
}

final class BidValueChanged extends BiddingEvent {
  const BidValueChanged(this.bid);

  final int bid;

  @override
  List<Object?> get props => [bid];
}

final class BidConfirmed extends BiddingEvent {
  const BidConfirmed();
}

final class CloseBiddingRequested extends BiddingEvent {
  const CloseBiddingRequested();
}
