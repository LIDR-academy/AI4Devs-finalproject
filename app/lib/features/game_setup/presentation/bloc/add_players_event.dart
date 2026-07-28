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

class PlayerRemoved extends AddPlayersEvent {
  const PlayerRemoved({required this.playerId});

  final String playerId;

  @override
  List<Object?> get props => [playerId];
}

class FavoriteChipTapped extends AddPlayersEvent {
  const FavoriteChipTapped({required this.favorite});

  final FavoritePlayer favorite;

  @override
  List<Object?> get props => [favorite];
}

class PlayerFavoriteToggled extends AddPlayersEvent {
  const PlayerFavoriteToggled({required this.playerId});

  final String playerId;

  @override
  List<Object?> get props => [playerId];
}

class EditSlotActivated extends AddPlayersEvent {
  const EditSlotActivated({required this.index});

  final int index;

  @override
  List<Object?> get props => [index];
}

class EditSlotCancelled extends AddPlayersEvent {
  const EditSlotCancelled();
}

class PlayerNameConfirmed extends AddPlayersEvent {
  const PlayerNameConfirmed({required this.index, required this.name});

  final int index;
  final String name;

  @override
  List<Object?> get props => [index, name];
}

class PlayerEditActivated extends AddPlayersEvent {
  const PlayerEditActivated({required this.playerId});

  final String playerId;

  @override
  List<Object?> get props => [playerId];
}

class PlayerNameUpdated extends AddPlayersEvent {
  const PlayerNameUpdated({required this.playerId, required this.newName});

  final String playerId;
  final String newName;

  @override
  List<Object?> get props => [playerId, newName];
}
