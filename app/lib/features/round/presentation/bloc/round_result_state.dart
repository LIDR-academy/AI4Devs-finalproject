import 'package:equatable/equatable.dart';
import 'package:la_pocha/features/round/domain/entities/round_result.dart';

sealed class RoundResultState extends Equatable {
  const RoundResultState();

  @override
  List<Object?> get props => [];
}

final class RoundResultInitial extends RoundResultState {
  const RoundResultInitial();
}

final class RoundResultLoading extends RoundResultState {
  const RoundResultLoading();
}

final class RoundResultLoaded extends RoundResultState {
  const RoundResultLoaded({required this.result});

  final RoundResult result;

  @override
  List<Object?> get props => [result];
}

final class RoundResultFailure extends RoundResultState {
  const RoundResultFailure({required this.message});

  final String message;

  @override
  List<Object?> get props => [message];
}

final class RoundResultNavigateToBids extends RoundResultState {
  const RoundResultNavigateToBids({
    required this.gameId,
    required this.roundNumber,
  });

  final String gameId;
  final int roundNumber;

  @override
  List<Object?> get props => [gameId, roundNumber];
}

final class RoundResultNavigateToFinal extends RoundResultState {
  const RoundResultNavigateToFinal({required this.gameId});

  final String gameId;

  @override
  List<Object?> get props => [gameId];
}

final class RoundResultAdvancing extends RoundResultState {
  const RoundResultAdvancing({required this.result});

  final RoundResult result;

  @override
  List<Object?> get props => [result];
}
