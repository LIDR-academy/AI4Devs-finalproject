import 'package:equatable/equatable.dart';

sealed class PlayStateEvent extends Equatable {
  const PlayStateEvent();

  @override
  List<Object?> get props => [];
}

final class PlayStateStarted extends PlayStateEvent {
  const PlayStateStarted({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundNumber];
}

final class IntroduceTricksRequested extends PlayStateEvent {
  const IntroduceTricksRequested();
}

final class BidsCorrectionSubmitted extends PlayStateEvent {
  const BidsCorrectionSubmitted(this.updatedBids);

  final Map<String, int> updatedBids;

  @override
  List<Object?> get props => [updatedBids];
}
