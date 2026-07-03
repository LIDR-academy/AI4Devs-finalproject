import 'package:equatable/equatable.dart';

sealed class ScoringEvent extends Equatable {
  const ScoringEvent();

  @override
  List<Object?> get props => [];
}

final class ScoringStarted extends ScoringEvent {
  const ScoringStarted({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundNumber];
}

final class TrickValueChanged extends ScoringEvent {
  const TrickValueChanged({
    required this.playerId,
    required this.value,
  });

  final String playerId;
  final int value;

  @override
  List<Object?> get props => [playerId, value];
}

final class CloseRoundRequested extends ScoringEvent {
  const CloseRoundRequested();
}
