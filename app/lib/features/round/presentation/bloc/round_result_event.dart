import 'package:equatable/equatable.dart';

sealed class RoundResultEvent extends Equatable {
  const RoundResultEvent();

  @override
  List<Object?> get props => [];
}

final class RoundResultStarted extends RoundResultEvent {
  const RoundResultStarted({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundNumber];
}

final class AdvanceToNextRoundRequested extends RoundResultEvent {
  const AdvanceToNextRoundRequested();
}

final class FinishGameRequested extends RoundResultEvent {
  const FinishGameRequested();
}
