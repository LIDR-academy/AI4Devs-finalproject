part of 'add_players_bloc.dart';

sealed class AddPlayersState extends Equatable {
  const AddPlayersState();

  @override
  List<Object?> get props => [];
}

class AddPlayersInitial extends AddPlayersState {
  const AddPlayersInitial();
}

class AddPlayersLoading extends AddPlayersState {
  const AddPlayersLoading();
}

class AddPlayersLoaded extends AddPlayersState {
  const AddPlayersLoaded({
    required this.gameId,
    required this.playerCount,
    required this.players,
    required this.isLoading,
    this.errorMessage,
  });

  final String gameId;
  final int playerCount;
  final List<PlayerEmbed> players;
  final bool isLoading;
  final String? errorMessage;

  bool get isComplete => players.length == playerCount;

  int get remainingCount => playerCount - players.length;

  AddPlayersLoaded copyWith({
    String? gameId,
    int? playerCount,
    List<PlayerEmbed>? players,
    bool? isLoading,
    String? errorMessage,
    bool clearError = false,
  }) {
    return AddPlayersLoaded(
      gameId: gameId ?? this.gameId,
      playerCount: playerCount ?? this.playerCount,
      players: players ?? this.players,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }

  @override
  List<Object?> get props => [
        gameId,
        playerCount,
        players,
        isLoading,
        errorMessage,
      ];
}

class AddPlayersFailure extends AddPlayersState {
  const AddPlayersFailure({required this.message});

  final String message;

  @override
  List<Object?> get props => [message];
}

class AddPlayersNavigateToSetup extends AddPlayersState {
  const AddPlayersNavigateToSetup({required this.gameId});

  final String gameId;

  @override
  List<Object?> get props => [gameId];
}
