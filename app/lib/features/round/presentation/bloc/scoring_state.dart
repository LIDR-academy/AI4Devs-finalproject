import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/game_setup/domain/entities/game.dart';
import 'package:la_pocha/features/game_setup/domain/entities/player_embed.dart';
import 'package:la_pocha/features/game_setup/domain/entities/round.dart';

sealed class ScoringState extends Equatable {
  const ScoringState();

  @override
  List<Object?> get props => [];
}

final class ScoringInitial extends ScoringState {
  const ScoringInitial();
}

final class ScoringLoading extends ScoringState {
  const ScoringLoading();
}

final class ScoringFailure extends ScoringState {
  const ScoringFailure({required this.message});

  final String message;

  @override
  List<Object?> get props => [message];
}

final class ScoringLoaded extends ScoringState {
  const ScoringLoaded({
    required this.game,
    required this.round,
    required this.players,
    required this.draftTricks,
    required this.tricksSum,
    required this.canConfirm,
    required this.scoresPreview,
    this.validationMessage,
    this.isClosing = false,
  });

  final Game game;
  final Round round;
  final List<PlayerEmbed> players;
  final Map<String, int> draftTricks;
  final int tricksSum;
  final bool canConfirm;
  final Map<String, int> scoresPreview;
  final String? validationMessage;
  final bool isClosing;

  ScoringLoaded copyWith({
    Game? game,
    Round? round,
    List<PlayerEmbed>? players,
    Map<String, int>? draftTricks,
    int? tricksSum,
    bool? canConfirm,
    Map<String, int>? scoresPreview,
    String? Function()? validationMessage,
    bool? isClosing,
  }) {
    return ScoringLoaded(
      game: game ?? this.game,
      round: round ?? this.round,
      players: players ?? this.players,
      draftTricks: draftTricks ?? this.draftTricks,
      tricksSum: tricksSum ?? this.tricksSum,
      canConfirm: canConfirm ?? this.canConfirm,
      scoresPreview: scoresPreview ?? this.scoresPreview,
      validationMessage: validationMessage != null
          ? validationMessage()
          : this.validationMessage,
      isClosing: isClosing ?? this.isClosing,
    );
  }

  @override
  List<Object?> get props => [
        game,
        round,
        players,
        draftTricks,
        tricksSum,
        canConfirm,
        scoresPreview,
        validationMessage,
        isClosing,
      ];
}

final class ScoringNavigateToResult extends ScoringState {
  const ScoringNavigateToResult({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundNumber];
}
