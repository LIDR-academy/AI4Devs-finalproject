part of 'cancel_game_cubit.dart';

sealed class CancelGameState {
  const CancelGameState();
}

final class CancelGameInitial extends CancelGameState {
  const CancelGameInitial();
}

final class CancelGameInProgress extends CancelGameState {
  const CancelGameInProgress();
}

final class CancelGameSuccess extends CancelGameState {
  const CancelGameSuccess();
}

final class CancelGameFailure extends CancelGameState {
  const CancelGameFailure({required this.message});

  final String message;
}
