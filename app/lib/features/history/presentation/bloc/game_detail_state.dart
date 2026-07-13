part of 'game_detail_bloc.dart';

sealed class GameDetailState extends Equatable {
  const GameDetailState();

  @override
  List<Object?> get props => [];
}

class GameDetailInitial extends GameDetailState {
  const GameDetailInitial();
}

class GameDetailLoading extends GameDetailState {
  const GameDetailLoading();
}

class GameDetailLoaded extends GameDetailState {
  const GameDetailLoaded({required this.detail});

  final GameDetail detail;

  @override
  List<Object?> get props => [detail];
}

class GameDetailFailure extends GameDetailState {
  const GameDetailFailure({required this.message});

  final String message;

  @override
  List<Object?> get props => [message];
}
