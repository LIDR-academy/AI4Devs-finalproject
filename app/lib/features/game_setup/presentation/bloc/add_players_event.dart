part of 'add_players_bloc.dart';

sealed class AddPlayersEvent extends Equatable {
  const AddPlayersEvent();

  @override
  List<Object?> get props => [];
}

class AddPlayersStarted extends AddPlayersEvent {
  const AddPlayersStarted({required this.gameId});

  final String gameId;

  @override
  List<Object?> get props => [gameId];
}

enum PlayerAddType { guest, registered, favorite }

class PlayerAdded extends AddPlayersEvent {
  const PlayerAdded({required this.name, required this.type});

  final String name;
  final PlayerAddType type;

  @override
  List<Object?> get props => [name, type];
}

class PlayerRemoved extends AddPlayersEvent {
  const PlayerRemoved({required this.playerId});

  final String playerId;

  @override
  List<Object?> get props => [playerId];
}

class ContinueRequested extends AddPlayersEvent {
  const ContinueRequested();
}
