part of 'game_sync_bloc.dart';

sealed class GameSyncState extends Equatable {
  const GameSyncState();

  @override
  List<Object?> get props => [];
}

final class GameSyncIdle extends GameSyncState {
  const GameSyncIdle();
}

final class GameSyncSuccess extends GameSyncState {
  const GameSyncSuccess({required this.gameId});

  final String gameId;

  @override
  List<Object?> get props => [gameId];
}

final class GameSyncFailure extends GameSyncState {
  const GameSyncFailure({required this.gameId, required this.outcome});

  final String gameId;
  final UploadFinishedGameOutcome outcome;

  @override
  List<Object?> get props => [gameId, outcome];
}
