part of 'repeat_game_cubit.dart';

sealed class RepeatGameState {
  const RepeatGameState();
}

final class RepeatGameInitial extends RepeatGameState {
  const RepeatGameInitial();
}

final class RepeatGameInProgress extends RepeatGameState {
  const RepeatGameInProgress();
}

final class RepeatGameSuccess extends RepeatGameState {
  const RepeatGameSuccess({required this.newGameId});

  final String newGameId;
}

final class RepeatGameFailure extends RepeatGameState {
  const RepeatGameFailure({required this.message});

  final String message;
}
