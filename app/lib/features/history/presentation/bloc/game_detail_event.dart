part of 'game_detail_bloc.dart';

sealed class GameDetailEvent extends Equatable {
  const GameDetailEvent();

  @override
  List<Object?> get props => [];
}

class GameDetailStarted extends GameDetailEvent {
  const GameDetailStarted({
    required this.gameId,
    required this.source,
  });

  final String gameId;
  final GameHistorySource source;

  @override
  List<Object?> get props => [gameId, source];
}
