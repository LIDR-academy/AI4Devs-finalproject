part of 'game_sync_bloc.dart';

sealed class GameSyncEvent extends Equatable {
  const GameSyncEvent();

  @override
  List<Object?> get props => [];
}

final class GameUploadRequested extends GameSyncEvent {
  const GameUploadRequested({required this.gameId});

  final String gameId;

  @override
  List<Object?> get props => [gameId];
}
