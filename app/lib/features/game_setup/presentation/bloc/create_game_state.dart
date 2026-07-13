part of 'create_game_bloc.dart';

sealed class CreateGameState extends Equatable {
  const CreateGameState();

  @override
  List<Object?> get props => [];
}

final class CreateGameInitial extends CreateGameState {
  const CreateGameInitial();
}

final class CreateGamePreview extends CreateGameState {
  const CreateGamePreview({
    required this.playerCount,
    required this.totalCards,
    required this.maxCardsPerRound,
    required this.totalRounds,
  });

  final int playerCount;
  final int totalCards;
  final int maxCardsPerRound;
  final int totalRounds;

  @override
  List<Object?> get props => [
        playerCount,
        totalCards,
        maxCardsPerRound,
        totalRounds,
      ];
}

final class CreateGameSubmitting extends CreateGameState {
  const CreateGameSubmitting({
    required this.playerCount,
    required this.totalCards,
    required this.maxCardsPerRound,
    required this.totalRounds,
  });

  final int playerCount;
  final int totalCards;
  final int maxCardsPerRound;
  final int totalRounds;

  @override
  List<Object?> get props => [
        playerCount,
        totalCards,
        maxCardsPerRound,
        totalRounds,
      ];
}

final class CreateGameSuccess extends CreateGameState {
  const CreateGameSuccess({required this.gameId});

  final String gameId;

  @override
  List<Object?> get props => [gameId];
}

final class CreateGameFailure extends CreateGameState {
  const CreateGameFailure({
    required this.message,
    required this.playerCount,
    required this.totalCards,
    required this.maxCardsPerRound,
    required this.totalRounds,
  });

  final String message;
  final int playerCount;
  final int totalCards;
  final int maxCardsPerRound;
  final int totalRounds;

  @override
  List<Object?> get props => [
        message,
        playerCount,
        totalCards,
        maxCardsPerRound,
        totalRounds,
      ];
}
