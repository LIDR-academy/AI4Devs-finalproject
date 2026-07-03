part of 'game_setup_bloc.dart';

sealed class GameSetupState extends Equatable {
  const GameSetupState();

  @override
  List<Object?> get props => [];
}

final class GameSetupInitial extends GameSetupState {
  const GameSetupInitial();
}

final class GameSetupLoading extends GameSetupState {
  const GameSetupLoading();
}

final class GameSetupLoaded extends GameSetupState {
  const GameSetupLoaded({
    required this.gameId,
    required this.game,
    required this.players,
    required this.firstDealerPlayerId,
    required this.isStarting,
  });

  final String gameId;
  final Game game;
  final List<PlayerEmbed> players;
  final String firstDealerPlayerId;
  final bool isStarting;

  bool get isComplete => players.length == game.playerCount;

  GameSetupLoaded copyWith({
    String? gameId,
    Game? game,
    List<PlayerEmbed>? players,
    String? firstDealerPlayerId,
    bool? isStarting,
  }) {
    return GameSetupLoaded(
      gameId: gameId ?? this.gameId,
      game: game ?? this.game,
      players: players ?? this.players,
      firstDealerPlayerId: firstDealerPlayerId ?? this.firstDealerPlayerId,
      isStarting: isStarting ?? this.isStarting,
    );
  }

  @override
  List<Object?> get props => [
        gameId,
        game,
        players,
        firstDealerPlayerId,
        isStarting,
      ];
}

final class GameSetupFailure extends GameSetupState {
  const GameSetupFailure({required this.message});

  final String message;

  @override
  List<Object?> get props => [message];
}

final class GameSetupNavigateToBids extends GameSetupState {
  const GameSetupNavigateToBids({
    required this.gameId,
    required this.roundId,
    required this.roundNumber,
  });

  final String gameId;
  final String roundId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundId, roundNumber];
}
