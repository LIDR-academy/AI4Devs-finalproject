part of 'repeat_round_cubit.dart';

sealed class RepeatRoundState {
  const RepeatRoundState();
}

final class RepeatRoundInitial extends RepeatRoundState {
  const RepeatRoundInitial();
}

final class RepeatRoundInProgress extends RepeatRoundState {
  const RepeatRoundInProgress();
}

final class RepeatRoundSuccess extends RepeatRoundState {
  const RepeatRoundSuccess({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;
}

final class RepeatRoundFailure extends RepeatRoundState {
  const RepeatRoundFailure({required this.message});

  final String message;
}
