part of 'create_game_bloc.dart';

sealed class CreateGameEvent extends Equatable {
  const CreateGameEvent();

  @override
  List<Object?> get props => [];
}

final class PlayerCountChanged extends CreateGameEvent {
  const PlayerCountChanged(this.playerCount);

  final int playerCount;

  @override
  List<Object?> get props => [playerCount];
}

final class CreateGameConfirmed extends CreateGameEvent {
  const CreateGameConfirmed();
}
