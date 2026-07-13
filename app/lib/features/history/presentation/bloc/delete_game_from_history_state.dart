part of 'delete_game_from_history_cubit.dart';

sealed class DeleteGameFromHistoryState {
  const DeleteGameFromHistoryState();
}

final class DeleteGameFromHistoryInitial extends DeleteGameFromHistoryState {
  const DeleteGameFromHistoryInitial();
}

final class DeleteGameFromHistoryInProgress extends DeleteGameFromHistoryState {
  const DeleteGameFromHistoryInProgress();
}

final class DeleteGameFromHistorySuccess extends DeleteGameFromHistoryState {
  const DeleteGameFromHistorySuccess({required this.gameId});

  final String gameId;
}

final class DeleteGameFromHistoryFailure extends DeleteGameFromHistoryState {
  const DeleteGameFromHistoryFailure({required this.message});

  final String message;
}
