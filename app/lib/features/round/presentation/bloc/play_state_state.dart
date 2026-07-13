import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/round/domain/entities/round_play_state.dart';

sealed class PlayStateBlocState extends Equatable {
  const PlayStateBlocState();

  @override
  List<Object?> get props => [];
}

final class PlayStateInitial extends PlayStateBlocState {
  const PlayStateInitial();
}

final class PlayStateLoading extends PlayStateBlocState {
  const PlayStateLoading();
}

final class PlayStateFailure extends PlayStateBlocState {
  const PlayStateFailure({required this.message});

  final String message;

  @override
  List<Object?> get props => [message];
}

final class PlayStateLoaded extends PlayStateBlocState {
  const PlayStateLoaded({required this.playState});

  final RoundPlayState playState;

  @override
  List<Object?> get props => [playState];
}

final class PlayStateNavigateToTricks extends PlayStateBlocState {
  const PlayStateNavigateToTricks({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundNumber];
}
