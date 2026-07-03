part of 'game_setup_bloc.dart';

sealed class GameSetupEvent extends Equatable {
  const GameSetupEvent();

  @override
  List<Object?> get props => [];
}

final class GameSetupStarted extends GameSetupEvent {
  const GameSetupStarted({required this.gameId});

  final String gameId;

  @override
  List<Object?> get props => [gameId];
}

final class PlayersReordered extends GameSetupEvent {
  const PlayersReordered({
    required this.oldIndex,
    required this.newIndex,
  });

  final int oldIndex;
  final int newIndex;

  @override
  List<Object?> get props => [oldIndex, newIndex];
}

final class FirstDealerSelected extends GameSetupEvent {
  const FirstDealerSelected({required this.playerId});

  final String playerId;

  @override
  List<Object?> get props => [playerId];
}

final class RandomDealerRequested extends GameSetupEvent {
  const RandomDealerRequested();
}

final class StartGameRequested extends GameSetupEvent {
  const StartGameRequested();
}
